import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { MONGODB_URI, MONGODB_DB } from '@/lib/db';

const client = new MongoClient(MONGODB_URI);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const encodedName = searchParams.get('name');

    if (!encodedName) {
      return NextResponse.json({
        success: false,
        message: '请提供名字参数'
      }, { status: 400 });
    }

    // 解码名字并打印日志，帮助调试
    const name = decodeURIComponent(encodedName);


    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('names');

    // 先尝试直接查询
    let nameDetail = await collection.findOne({ name: name });

    // 如果没找到，尝试去除可能的空格
    if (!nameDetail) {
      nameDetail = await collection.findOne({ name: name.trim() });
    }

    // 如果还是没找到，打印一下集合中的部分数据，帮助调试
    if (!nameDetail) {
      const sampleDocs = await collection.find({}).limit(5).toArray();

      
      return NextResponse.json({
        success: false,
        message: '未找到名字信息'
      }, { status: 404 });
    }

    // 打印找到的数据，帮助调试


    return NextResponse.json({
      success: true,
      data: {
        name: nameDetail.name,
        content: nameDetail.content,
        score: nameDetail.score
      }
    });

  } catch (error) {
    console.error('获取名字详情失败:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  } finally {
    await client.close();
  }
}