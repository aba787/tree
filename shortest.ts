
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { shortestPathBFS } from '../../lib/shortestPath';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'from and to parameters are required' });
  }

  // Fetch all transmission edges
  const { data: edges, error } = await supabase
    .from('transmissions')
    .select('teacher_id,student_id');
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const formatted = edges.map((e: any) => ({ 
    from: e.teacher_id, 
    to: e.student_id 
  }));

  const path = shortestPathBFS(String(from), String(to), formatted);
  
  if (!path) {
    return res.status(404).json({ message: 'No scholarly chain found between these persons' });
  }

  return res.json({ path });
}
