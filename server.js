const path = require('path');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
console.log("SUPABASE_URL =", SUPABASE_URL);
console.log("SUPABASE_ANON_KEY =", SUPABASE_ANON_KEY);

// 重点：手动传入 fetch，修复 fetch failed
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  fetch: fetch
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

// 获取任务，支持优先级筛选
app.get('/api/tasks', async (req, res) => {
  try {
    const { priority } = req.query;
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    const { data, error } = await query;
    if (error) {
      console.error('supabase查询错误：', error);
      return res.status(500).json(error);
    }
    res.json(data);
  } catch (e) {
    console.error('接口异常：', e);
    res.status(500).json({ err: e.message });
  }
});

// 新增任务
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, priority } = req.body;
    if (!title || !priority) return res.status(400).json({ msg: '缺少内容' });
    const { data, error } = await supabase.from('tasks').insert([{ title, priority }]).select();
    if (error) {
      console.error('supabase插入错误：', error);
      return res.status(500).json(error);
    }
    res.json(data[0]);
  } catch (e) {
    console.error('接口异常：', e);
    res.status(500).json({ err: e.message });
  }
});

// 切换完成状态
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_completed } = req.body;
    const { data, error } = await supabase.from('tasks').update({ is_completed }).eq('id', id).select();
    if (error) {
      console.error('supabase更新错误：', error);
      return res.status(500).json(error);
    }
    res.json(data[0]);
  } catch (e) {
    console.error('接口异常：', e);
    res.status(500).json({ err: e.message });
  }
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('supabase删除错误：', error);
      return res.status(500).json(error);
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('接口异常：', e);
    res.status(500).json({ err: e.message });
  }
});

module.exports = app;
