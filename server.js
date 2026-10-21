const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========修改这里的 SUPABASE_ANON_KEY==========
const SUPABASE_URL = "https://jzuagaddlequbbphcfq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_E_09IMIwSDtydFnaFPpVsA_XuEgElJm";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 获取任务，支持优先级筛选
app.get('/api/tasks', async (req, res) => {
  const { filter } = req.query;
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if(filter && filter !== '全部'){
    query = query.eq('priority', filter);
  }
  const {data,error} = await query;
  res.json({data,error});
});

// 添加任务
app.post('/api/tasks', async (req,res)=>{
  const {title,priority} = req.body;
  const {data,error} = await supabase.from('tasks').insert([{title,priority}]).select();
  res.json({data,error});
});

// 修改完成状态
app.patch('/api/tasks/:id', async (req,res)=>{
  const {id} = req.params;
  const {is_completed} = req.body;
  const {data,error} = await supabase.from('tasks').update({is_completed}).eq('id',id).select();
  res.json({data,error});
});

// 删除任务
app.delete('/api/tasks/:id', async (req,res)=>{
  const {id} = req.params;
  const {error} = await supabase.from('tasks').delete().eq('id',id);
  res.json({error});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log(`服务启动，端口：${PORT}`);
});
