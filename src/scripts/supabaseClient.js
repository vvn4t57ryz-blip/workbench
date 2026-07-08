/**
 * supabaseClient.js - Supabase 客户端封装
 * 提供认证、实时订阅等功能
 */

(function() {
  'use strict';

  // Supabase 配置
  // 注意：请替换为您的 Supabase 项目 URL 和匿名密钥
  const SUPABASE_URL = window.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

  let supabase = null;

  // 初始化 Supabase 客户端
  function initSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.log('[Supabase] 未配置 SUPABASE_URL 或 SUPABASE_ANON_KEY，跳过初始化');
      return null;
    }

    if (typeof window.supabase === 'undefined') {
      console.warn('[Supabase] Supabase JS 库未加载');
      return null;
    }

    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });

      console.log('[Supabase] 客户端初始化成功');
      return supabase;
    } catch (error) {
      console.error('[Supabase] 初始化失败:', error);
      return null;
    }
  }

  // 认证相关功能
  const authAPI = {
    // 邮箱注册
    async signUp(email, password) {
      if (!supabase) return { error: new Error('Supabase 未初始化') };
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error('[Supabase] 注册失败:', error);
        return { error };
      }

      // 注册成功后，分发认证状态变化事件
      if (data.user) {
        window.dispatchEvent(new CustomEvent('supabase-auth-change', {
          detail: { user: data.user, session: data.session }
        }));
      }

      return { data, error: null };
    },

    // 邮箱登录
    async signIn(email, password) {
      if (!supabase) return { error: new Error('Supabase 未初始化') };
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('[Supabase] 登录失败:', error);
        return { error };
      }

      if (data.user) {
        window.dispatchEvent(new CustomEvent('supabase-auth-change', {
          detail: { user: data.user, session: data.session }
        }));
      }

      return { data, error: null };
    },

    // 退出登录
    async signOut() {
      if (!supabase) return { error: new Error('Supabase 未初始化') };
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[Supabase] 退出失败:', error);
        return { error };
      }

      window.dispatchEvent(new CustomEvent('supabase-auth-change', {
        detail: { user: null, session: null }
      }));

      return { error: null };
    },

    // 获取当前用户
    async getCurrentUser() {
      if (!supabase) return { user: null, error: new Error('Supabase 未初始化') };
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('[Supabase] 获取用户失败:', error);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    },

    // 获取当前会话
    async getSession() {
      if (!supabase) return { session: null, error: new Error('Supabase 未初始化') };
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Supabase] 获取会话失败:', error);
        return { session: null, error };
      }

      return { session: data.session, error: null };
    },

    // 监听认证状态变化
    onAuthStateChange(callback) {
      if (!supabase) {
        console.warn('[Supabase] 未初始化，无法监听认证状态');
        return null;
      }

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[Supabase] 认证状态变化:', event);
        
        const user = session?.user || null;
        
        // 分发自定义事件
        window.dispatchEvent(new CustomEvent('supabase-auth-change', {
          detail: { user, session, event }
        }));

        if (callback) {
          callback(event, session);
        }
      });

      return data.subscription;
    }
  };

  // 数据库操作封装
  const dbAPI = {
    // 通用查询
    async select(table, options = {}) {
      if (!supabase) return { data: null, error: new Error('Supabase 未初始化') };
      
      let query = supabase.from(table).select(options.columns || '*');
      
      if (options.eq) {
        query = query.eq(options.eq.column, options.eq.value);
      }
      
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      return { data, error };
    },

    // 插入数据
    async insert(table, data) {
      if (!supabase) return { data: null, error: new Error('Supabase 未初始化') };
      
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();

      return { data: result, error };
    },

    // 更新数据
    async update(table, data, match) {
      if (!supabase) return { data: null, error: new Error('Supabase 未初始化') };
      
      let query = supabase.from(table).update(data);
      
      if (match) {
        query = query.eq(match.column, match.value);
      }

      const { data: result, error } = await query.select();
      return { data: result, error };
    },

    // 删除数据
    async delete(table, match) {
      if (!supabase) return { data: null, error: new Error('Supabase 未初始化') };
      
      let query = supabase.from(table).delete();
      
      if (match) {
        query = query.eq(match.column, match.value);
      }

      const { data: result, error } = await query.select();
      return { data: result, error };
    },

    // Upsert（插入或更新）
    async upsert(table, data, onConflict) {
      if (!supabase) return { data: null, error: new Error('Supabase 未初始化') };
      
      const { data: result, error } = await supabase
        .from(table)
        .upsert(data, { onConflict })
        .select();

      return { data: result, error };
    }
  };

  // 实时订阅封装
  const realtimeAPI = {
    // 订阅表变化
    subscribe(table, callback, filter) {
      if (!supabase) {
        console.warn('[Supabase] 未初始化，无法订阅实时数据');
        return null;
      }

      let channel = supabase.channel(table + '_changes');
      
      channel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        }, (payload) => {
          console.log('[Supabase] 实时更新:', payload);
          if (callback) {
            callback(payload);
          }
        })
        .subscribe();

      return channel;
    },

    // 取消订阅
    unsubscribe(channel) {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    }
  };

  // 初始化
  const client = initSupabase();

  // 如果初始化成功，设置到 dataService
  if (client && window.dataService) {
    window.dataService.setSupabaseClient(client);
    
    // 检查当前会话
    authAPI.getSession().then(({ session }) => {
      if (session?.user) {
        window.dataService.setCurrentUser(session.user);
        console.log('[Supabase] 已恢复登录状态:', session.user.email);
      }
    });
  }

  // 暴露到全局
  window.supabaseClient = {
    client: supabase,
    auth: authAPI,
    db: dbAPI,
    realtime: realtimeAPI,
    isReady: () => !!supabase
  };
})();
