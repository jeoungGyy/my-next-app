import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'mydb'; // 실제 DB 이름으로 바꾸세요
const COLLECTION_NAME = 'notes';

export async function GET_handler() {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const notes = await db.collection(COLLECTION_NAME).find({}).toArray();
        return new Response(JSON.stringify(notes), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('GET 오류:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function POST_handler(req) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const { text, startDate, endDate, user } = await req.json();

        const result = await db.collection(COLLECTION_NAME).insertOne({
            text,
            user,
            status: '', // 기본 상태 빈 문자열로 수정
            startDate: startDate || null,
            endDate: endDate || null,
            createdAt: new Date(),
        });

        return new Response(JSON.stringify(result), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('POST 오류:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function DELETE_handler(req) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) return new Response('Missing id', { status: 400 });

        try {
            const objectId = new ObjectId(id);
            await db.collection(COLLECTION_NAME).deleteOne({ _id: objectId });
        } catch {
            return new Response('Invalid id format', { status: 400 });
        }

        return new Response('Deleted', { status: 200 });
    } catch (err) {
        console.error('DELETE 오류:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export async function PATCH_handler(req) {
    try {
        const client = await clientPromise;
        const db = client.db('mydb');
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response('Missing id', { status: 400 });
        }

        const { startDate, endDate, status } = await req.json();

        const updateFields = {};
        if (startDate !== undefined) updateFields.startDate = startDate;
        if (endDate !== undefined) updateFields.endDate = endDate;
        if (status !== undefined) updateFields.status = status;

        if (Object.keys(updateFields).length === 0) {
            return new Response('No fields to update', { status: 400 });
        }

        const objectId = new ObjectId(id);
        await db.collection('notes').updateOne(
            { _id: objectId },
            { $set: updateFields }
        );

        return new Response('Updated', { status: 200 });
    } catch (err) {
        console.error('PATCH 오류:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}
