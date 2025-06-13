import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const notes = await db.collection('notes').find({}).toArray();
    return new Response(JSON.stringify(notes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET 오류:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { text } = await req.json();
    const result = await db.collection('notes').insertOne({ text });
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST 오류:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return new Response('Missing id', { status: 400 });

    await db.collection('notes').deleteOne({ _id: new ObjectId(id) });

    return new Response('Deleted', { status: 200 });
  } catch (err) {
    console.error('DELETE 오류:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
