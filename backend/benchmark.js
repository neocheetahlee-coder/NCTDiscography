const app = require('./server');
const { performance } = require('node:perf_hooks');

const REAL_SONG_COUNT = 562;
const SIMULATED_SIZES = [5000, 20000];
const customSort = app.locals.customSort;

function insertionSort(songs) {
    const result = [...songs];
    for (let i = 1; i < result.length; i++) {
        const current = result[i];
        let j = i - 1;
        while (j >= 0 && result[j].trackName.localeCompare(current.trackName) > 0) {
            result[j + 1] = result[j];
            j--;
        }
        result[j + 1] = current;
    }
    return result;
}

async function loadRealSongs() {
    const server = app.listen(0, '127.0.0.1');
    try {
        await new Promise((resolve, reject) => {
            server.once('listening', resolve);
            server.once('error', reject);
        });

        const { port } = server.address();
        const response = await fetch(`http://127.0.0.1:${port}/api/songs`);
        if (!response.ok) {
            throw new Error(`Could not load real songs: HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data.songs) || data.songs.length < REAL_SONG_COUNT) {
            throw new Error(`Expected at least ${REAL_SONG_COUNT} real songs; received ${data.songs?.length ?? 0}`);
        }
        return data.songs.slice(0, REAL_SONG_COUNT);
    } finally {
        await new Promise((resolve, reject) => {
            server.close(error => error ? reject(error) : resolve());
        });
    }
}

function createSimulatedSongs(count) {
    return Array.from({ length: count }, (_, index) => {
        const shuffledIndex = (index * 7919) % count;
        return {
            trackId: index,
            trackName: `Track ${String(shuffledIndex).padStart(5, '0')}`,
            releaseDate: new Date(Date.UTC(2000 + (index % 25), index % 12, (index % 28) + 1)).toISOString(),
        };
    });
}

function benchmarkSorts(label, songs) {
    const measurements = {};

    let start = performance.now();
    console.time(`Insertion Sort | ${label}`);
    insertionSort(songs);
    console.timeEnd(`Insertion Sort | ${label}`);
    measurements.insertionSortMs = Number((performance.now() - start).toFixed(2));

    start = performance.now();
    console.time(`Heap Sort | ${label}`);
    customSort(songs, 'az');
    console.timeEnd(`Heap Sort | ${label}`);
    measurements.heapSortMs = Number((performance.now() - start).toFixed(2));

    return { dataset: label, n: songs.length, ...measurements };
}

async function main() {
    if (typeof customSort !== 'function') {
        throw new Error('Heap Sort function is not available from backend/server.js');
    }

    console.log('Loading the current backend song catalog for the real-data benchmark...');
    const realSongs = await loadRealSongs();
    const results = [benchmarkSorts('real data', realSongs)];

    for (const size of SIMULATED_SIZES) {
        results.push(benchmarkSorts('simulated data', createSimulatedSongs(size)));
    }

    console.log('\nBenchmark summary (times in milliseconds):');
    console.table(results);
}

main().catch(error => {
    console.error('Benchmark failed:', error);
    process.exitCode = 1;
});
