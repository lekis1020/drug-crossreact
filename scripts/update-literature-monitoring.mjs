#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const DEFAULT_DB_PATH = 'crossreact_prediction_db.json';
const DEFAULT_DAYS_BACK = 30;
const DEFAULT_MAX_RESULTS = 150;
const MAX_RECORDS_TO_KEEP = 600;

const PUBMED_QUERY = [
  '((beta-lactam*[Title/Abstract] OR cephalosporin*[Title/Abstract] OR penicillin*[Title/Abstract] OR carbapenem*[Title/Abstract] OR monobactam*[Title/Abstract] OR antibiotic*[Title/Abstract]))',
  'AND (cross-react*[Title/Abstract] OR hypersensitiv*[Title/Abstract] OR allergy[Title/Abstract] OR anaphylaxis[Title/Abstract])',
  'AND (case report[Publication Type] OR clinical study[Publication Type] OR cohort[Title/Abstract] OR trial[Title/Abstract])',
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
  console.log(`Usage: node scripts/update-literature-monitoring.mjs [options]

Options:
  --db <path>           Path to database JSON (default: ${DEFAULT_DB_PATH})
  --days-back <number>  PubMed publication date window in days (default: ${DEFAULT_DAYS_BACK})
  --max-results <num>   Max PubMed IDs to fetch each run (default: ${DEFAULT_MAX_RESULTS})
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
  if (!response.ok) {
    throw new Error(`PubMed esearch failed (${response.status})`);
  }

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
  if (!response.ok) {
    throw new Error(`PubMed esummary failed (${response.status})`);
  }

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
    .sort((a, b) => {
      const dateA = a.pubdate ?? '';
      const dateB = b.pubdate ?? '';
      return dateB.localeCompare(dateA);
    })
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
  const database = JSON.parse(raw);

  const pmids = await fetchPubMedIds({
    query: PUBMED_QUERY,
    daysBack: Math.floor(options.daysBack),
    maxResults: Math.floor(options.maxResults),
  });

  const summaries = await fetchPubMedSummaries(pmids);

  const existingRecords = database.literature_monitoring?.records ?? [];
  const merged = mergeRecords(existingRecords, summaries, checkedAtIso);

  database.literature_monitoring = {
    strategy: 'PubMed E-utilities scheduled monitor',
    query: PUBMED_QUERY,
    checked_window_days: Math.floor(options.daysBack),
    max_results: Math.floor(options.maxResults),
    checked_at: checkedAtIso,
    records: merged,
  };

  database.metadata = {
    ...(database.metadata ?? {}),
    last_literature_monitoring_at: checkedAtIso,
  };

  await writeFile(options.dbPath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');

  const newCount = summaries.filter((item) => !existingRecords.some((r) => r.pmid === item.pmid)).length;
  console.log(
    `[monitoring] checked=${summaries.length} new=${newCount} total_records=${merged.length} db=${options.dbPath}`,
  );
}

main().catch((error) => {
  console.error('[monitoring] failed:', error.message);
  process.exitCode = 1;
});
