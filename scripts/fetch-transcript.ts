import { runFetchTranscript } from './transcript/cli.ts';

runFetchTranscript(process.argv.slice(2)).then((code) => process.exit(code));
