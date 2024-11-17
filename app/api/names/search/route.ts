import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { MONGODB_URI, MONGODB_DB } from '@/lib/db';

const client = new MongoClient(MONGODB_URI);

// 添加接口定义
interface MatchStage {
  name?: RegExp;
  $or?: Array<{
    gender_suitability: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lastName = searchParams.get('lastName') || '';
    const gender = searchParams.get('gender') || '';
    const containChar = searchParams.get('containChar') || '';
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '9');
    const skip = (page - 1) * pageSize;

    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('names');

    const matchStage: MatchStage = {};
    if (containChar) {
      matchStage.name = new RegExp(containChar);
    }
    if (gender) {
      matchStage.$or = [
        { gender_suitability: gender },
        { gender_suitability: '通用' }
      ];
    }

    const pipeline = [
      { $match: matchStage },
      { $sample: { size: pageSize } },
      { $limit: pageSize }
    ];

    const names = await collection
      .aggregate(pipeline, { allowDiskUse: true })
      .toArray();

    const result = names.map(nameData => ({
      ...nameData,
      fullName: lastName + nameData.name
    }));

    return NextResponse.json({
      success: true,
      data: result,
      page,
      pageSize
    });

  } catch (error) {
    console.error('搜索名字时出错:', error);
    return NextResponse.json(
      { success: false, error: '搜索失败，请稍后重试' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 