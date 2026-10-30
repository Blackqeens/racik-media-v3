import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Controller('health')
export class AppController {
  constructor(private readonly configService: ConfigService) { }

  /**
   * GET /api/v1/health
   */
  @Get()
  async checkHealth() {
    const timestamp = new Date().toISOString();
    let dbStatus = 'checking';

    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
      const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Cek koneksi ke tabel profiles
      const { error } = await supabase.from('individual_profiles').select('id').limit(1);
      dbStatus = error ? `degraded: ${error.message}` : 'up';
    } catch (err: any) {
      dbStatus = `down: ${err.message}`;
    }

    return {
      status: dbStatus === 'up' ? 'ok' : 'degraded',
      timestamp,
      services: {
        database: dbStatus,
        api: 'up',
      },
    };
  }
}
