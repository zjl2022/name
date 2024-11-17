import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { MONGODB_URI, MONGODB_DB } from '@/lib/db';

const client = new MongoClient(MONGODB_URI);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    const gender = searchParams.get('gender') || 'all';

    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('zi');

    // 构建查询条件
    let query = {};
    if (gender === 'male') {
      query = { 
        $or: [
          { gender_preference: '男' },
          { gender_preference: { $exists: false } }  // 包含空值
        ]
      };
    } else if (gender === 'female') {
      query = { 
        $or: [
          { gender_preference: '女' },
          { gender_preference: { $exists: false } }  // 包含空值
        ]
      };
    }

    const skip = (page - 1) * pageSize;
    const total = await collection.countDocuments(query);
    
    const characters = await collection
      .find(query, { 
        projection: { 
          _id: 0, 
          character: 1,
          gender_preference: 1,
          usage_count: 1
        } 
      })
      .sort({ usage_count: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        characters,
        total,
        page,
        pageSize
      }
    });

  } catch (error) {
    console.error('获取汉字列表失败:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  } finally {
    await client.close();
  }
} 