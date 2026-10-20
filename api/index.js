app.use(express.static('public'));

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// ========== 在这里替换成你自己的密钥 ==========
const SUPABASE_URL = "https://jzuagaddlequbbphcfq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E_09IMIwSDtydFnaFPpVsA_XuEgElJm";
// ==========================================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 获取任务列表，支持优先级筛选
app.get('/api/tasks', async (req, res) => {
  const { priority } = req.query;
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if(priority && priority !== 'all'){
    query = query.eq('priority', priority);
  }
  const { data, error } = await query;
  if(error) return res.status(500).json({error: error.message});
  res.json(data);
});

// 新增任务
app.post('/api/tasks', async (req, res) => {
  const { title, priority } = req.body;
  const { data, error } = await supabase.from('tasks').insert([
    { title, priority, is_done: false }
  ]).select();
  if(error) return res.status(500).json({error: error.message});
  res.json(data[0]);
});

// 修改完成状态
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { is_done } = req.body;
  const { data, error } = await supabase.from('tasks').update({is_done}).eq('id', id).select();
  if(error) return res.status(500).json({error: error.message});
  res.json(data[0]);
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if(error) return res.status(500).json({error: error.message});
  res.json({ok:true});
});

module.exports = app;
