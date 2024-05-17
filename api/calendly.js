const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  console.log('Request received:', req.body); // Log the incoming request

  if (req.method === 'POST') {
    const { event, payload } = req.body;

    console.log('Event:', event);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    if (event === 'invitee.created' && payload.scheduled_event.name === 'Design Review') {
      // Extract configuration_id from the UTM parameters
      const configurationId = payload.tracking.utm_content;

      console.log('Configuration ID:', configurationId);

      if (!configurationId) {
        console.error('Missing configuration_id in UTM content');
        return res.status(400).json({ error: 'Missing configuration_id in UTM content' });
      }

      try {
        const { data, error } = await supabase
          .from('project_progress')
          .update({ current_step_id: 2 })
          .eq('configuration_id', configurationId);

        if (error) {
          console.error('Error updating project progress:', error);
          return res.status(500).json({ error: 'Failed to update project progress', details: error.message });
        }

        console.log('Update successful:', data);
        return res.status(200).json({ message: 'Updated successfully', data });
      } catch (error) {
        console.error('Network or fetch error:', error);
        return res.status(500).json({ error: 'Failed to connect to Supabase', details: error.message });
      }
    } else {
      console.error('Invalid event type or missing required data');
      return res.status(400).json({ message: 'Invalid event type or missing required data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
