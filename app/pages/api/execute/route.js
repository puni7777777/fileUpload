// import { execSync } from 'child_process';

import { NextResponse } from 'next/server';

export function GET(req, res) {
    try {
        const execSync = require('child_process').execSync;
        const output = execSync('dir', { encoding: 'utf-8' });
        const splitted = output.split(/\r?\n/);
        const filtered = splitted.filter(e => e !== '');

        return NextResponse.json({ status: "success", data: filtered });

    } catch (error) {
        return NextResponse.json({ status: "error", data: error });
    }
}