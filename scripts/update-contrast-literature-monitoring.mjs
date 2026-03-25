#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const DEFAULT_DB_PATH = 'contrast_crossreact_db.json';
const DEFAULT_DAYS_BACK = 30;
const DEFAULT_MAX_RESULTS = 150;
const MAX_RECORDS_TO_KEEP = 800;

const PUBMED_QUERY = [
  '(("contrast media"[MeSH Terms] OR "iodinated contrast"[Title/Abstract] OR "contrast media"[Title/Abstract])',
  'OR iohexol[Title/Abstract] OR iopromide[Title/Abstract] OR iopamidol[Title/Abstract] OR ioversol[Title/Abstract]',
  'OR iomeprol[Title/Abstract] OR iobitridol[Title/Abstract] OR iodixanol[Title/Abstract] OR ioxaglate[Title/Abstract]',
  'OR ioxitalamate[Title/Abstract] OR diatrizoate[Title/Abstract])',
  'AND (cross-react*[Title/Abstract] OR hypersensitiv*[Title/Abstract] OR allergy[Title/Abstract] OR anaphylaxis[Title/Abstract])',
  'AND (skin test[Title/Abstract] OR provocation[Title/Abstract] OR case report[Publication Type] OR cohort[Title/Abstract] OR study[Title/Abstract])',
].join(' ');

function parseArgs(argv) {
  const options = {
    dbPath: DEFAULT_DB_PATH,
    daysBack: DEFAULT_DAYS_BACK,
    maxResults: DEFAULT_MAX_RESULTS,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--db') {
      options.dbPath = argv[i + 1] ?? options.dbPath;
      i += 1;
      continue;
    }

    if (arg === '--days-back') {
      options.daysBack = Number(argv[i + 1] ?? options.daysBack);
      i += 1;
      continue;
    }

    if (arg === '--max-results') {
      options.maxResults = Number(argv[i + 1] ?? options.maxResults);
      i += 1;
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/update-contrast-literature-monitoring.mjs [options]

Options:
  --db <path>           Path to contrast DB JSON (default: ${DEFAULT_DB_PATH})
  --days-back <number>  Publication window in days (default: ${DEFAULT_DAYS_BACK})
  --max-results <num>   Max PubMed IDs each run (default: ${DEFAULT_MAX_RESULTS})
  --help, -h            Show help
`);
}

async function fetchPubMedIds({ query, daysBack, maxResults }) {
  const endpoint = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi');
  endpoint.searchParams.set('db', 'pubmed');
  endpoint.searchParams.set('retmode', 'json');
  endpoint.searchParams.set('sort', 'pub+date');
  endpoint.searchParams.set('datetype', 'pdat');
  endpoint.searchParams.set('reldate', String(daysBack));
  endpoint.searchParams.set('retmax', String(maxResults));
  endpoint.searchParams.set('term', query);

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`PubMed esearch failed (${response.status})`);

  const payload = await response.json();
  return payload?.esearchresult?.idlist ?? [];
}

async function fetchPubMedSummaries(pmids) {
  if (pmids.length === 0) return [];

  const endpoint = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi');
  endpoint.searchParams.set('db', 'pubmed');
  endpoint.searchParams.set('retmode', 'json');
  endpoint.searchParams.set('id', pmids.join(','));

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`PubMed esummary failed (${response.status})`);

  const payload = await response.json();
  const result = payload?.result ?? {};
  const ids = result?.uids ?? [];

  return ids
    .map((pmid) => result[pmid])
    .filter(Boolean)
    .map((entry) => {
      const doi = Array.isArray(entry.articleids)
        ? entry.articleids.find((item) => item?.idtype === 'doi')?.value ?? null
        : null;

      return {
        pmid: String(entry.uid),
        title: entry.title ?? null,
        journal: entry.fulljournalname ?? entry.source ?? null,
        pubdate: entry.pubdate ?? null,
        doi,
      };
    });
}

function mergeRecords(existingRecords, incomingRecords, checkedAtIso) {
  const byPmid = new Map(existingRecords.map((item) => [item.pmid, item]));

  for (const record of incomingRecords) {
    const existing = byPmid.get(record.pmid);

    if (!existing) {
      byPmid.set(record.pmid, {
        ...record,
        source: 'pubmed',
        status: 'needs_review',
        pubmed_url: `https://pubmed.ncbi.nlm.nih.gov/${record.pmid}/`,
        first_seen_at: checkedAtIso,
        last_seen_at: checkedAtIso,
      });
      continue;
    }

    byPmid.set(record.pmid, {
      ...existing,
      ...record,
      status: existing.status ?? 'needs_review',
      first_seen_at: existing.first_seen_at ?? checkedAtIso,
      last_seen_at: checkedAtIso,
      pubmed_url: existing.pubmed_url ?? `https://pubmed.ncbi.nlm.nih.gov/${record.pmid}/`,
    });
  }

  return [...byPmid.values()]
    .sort((a, b) => (b.pubdate ?? '').localeCompare(a.pubdate ?? ''))
    .slice(0, MAX_RECORDS_TO_KEEP);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  if (!Number.isFinite(options.daysBack) || options.daysBack <= 0) {
    throw new Error('--days-back must be a positive number');
  }

  if (!Number.isFinite(options.maxResults) || options.maxResults <= 0) {
    throw new Error('--max-results must be a positive number');
  }

  const checkedAtIso = new Date().toISOString();
  const raw = await readFile(options.dbPath, 'utf8');
  const db = JSON.parse(raw);

  const pmids = await fetchPubMedIds({
    query: PUBMED_QUERY,
    daysBack: Math.floor(options.daysBack),
    maxResults: Math.floor(options.maxResults),
  });

  const summaries = await fetchPubMedSummaries(pmids);
  const existingRecords = db.literature_monitoring?.records ?? [];
  const merged = mergeRecords(existingRecords, summaries, checkedAtIso);

  db.literature_monitoring = {
    strategy: 'PubMed E-utilities scheduled monitor',
    query: PUBMED_QUERY,
    checked_window_days: Math.floor(options.daysBack),
    max_results: Math.floor(options.maxResults),
    checked_at: checkedAtIso,
    records: merged,
  };

  db.metadata = {
    ...(db.metadata ?? {}),
    last_database_update_at: checkedAtIso,
    last_literature_monitoring_at: checkedAtIso,
  };

  await writeFile(options.dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');

  const newCount = summaries.filter((item) => !existingRecords.some((row) => row.pmid === item.pmid)).length;
  console.log(`[contrast-monitoring] checked=${summaries.length} new=${newCount} total_records=${merged.length}`);
}

main().catch((error) => {
  console.error('[contrast-monitoring] failed:', error.message);
  process.exitCode = 1;
});
