const path = require('path');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const app = express();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
// =========👉就是这里！两行打印放在这=========
console.log("SUPABASE_URL =", SUPABASE_URL);
console.log("SUPABASE_ANON_KEY =", SUPABASE_ANON_KEY);
// =========================================
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());

// 获取任务，支持优先级筛选
app.get('/api/tasks', async (req, res) => {
  const { priority } = req.query;
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json(error);
  res.json(data);
});
// 新增任务
app.post('/api/tasks', async (req, res) => {
  const { title, priority } = req.body;
  if (!title || !priority) return res.status(400).json({msg:'缺少内容'});
  const { data, error } = await supabase.from('tasks').insert([{ title, priority }]).select();
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});
// 切换完成状态
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { is_completed } = req.body;
  const { data, error } = await supabase.from('tasks').update({ is_completed }).eq('id', id).select();
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});
// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return res.status(500).json(error);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务运行在端口 ${PORT}`);
});
