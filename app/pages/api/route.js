// API Route
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'
import { writeFile } from "fs/promises";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('files');
        if (!file) {
            return NextResponse.json({ success: false });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        if (file.name.split('.')[1] === 'mp4') {
            const uniqueFileName = `${uuidv4()}${file.name}`;

            const dirPath = './files/';
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true }); // add recursive flag
            }
            const filePath = `./files/${uniqueFileName}`;
            try {
                await writeFile(filePath, buffer);
                console.log(`file ${filePath} uploaded successfully`);
                return NextResponse.json({ status: "success", data: file.size });
            } catch (writeError) {
                console.error("Error writing file:", writeError);
                return NextResponse.json({ status: "fail", data: writeError });
            }
        } else {
            console.log('file not uploaded')
            return NextResponse.json({ status: "fail", data: "Only png files are allowed" })
        }
    } catch (e) {
        console.error("Error uploading file:", e);
        return NextResponse.json({ status: "fail", data: e });
    }
}