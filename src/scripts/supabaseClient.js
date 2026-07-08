/**
 * Supabase 客户端初始化
 * 用于云端数据同步和用户认证
 */

(function() {
  'use strict';

  // Supabase 配置 - 从环境变量或全局配置获取
  const SUPABASE_URL = window.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

  // Supabase 客户端实例
  let supabaseClient = null;
  let isConnected = false;
  let currentUser = null;

  /**
   * 初始化 Supabase 客户端
   * @returns {boolean} 是否成功初始化
   */
  function initSupabase() {
    // 检查是否已配置 Supabase
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.log('[Supabase] 未配置 Supabase URL 或 Key，将使用 localStorage 模式');
      isConnected = false;
      return false;
    }

    try {
      // 创建 Supabase 客户端
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      
      isConnected = true;
      console.log('[Supabase] 客户端初始化成功');
      
      // 监听认证状态变化
      supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        console.log('[Supabase] 认证状态变化:', event, currentUser?.email || '未登录');
        
        // 触发全局事件，通知数据服务层更新
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('supabase-auth-change', {
            detail: { user: currentUser, event: event }
          }));
        }
      });

      return true;
    } catch (error) {
      console.error('[Supabase] 初始化失败:', error);
      isConnected = false;
      return false;
    }
  }

  /**
   * 获取当前登录用户
   * @returns {Object|null} 用户对象或 null
   */
  function getCurrentUser() {
    return currentUser;
  }

  /**
   * 获取 Supabase 客户端实例
   * @returns {Object|null} Supabase 客户端或 null
   */
  function getClient() {
    return supabaseClient;
  }

  /**
   * 检查是否已连接到 Supabase
   * @returns {boolean} 是否已连接
   */
  function isConnectedToSupabase() {
    return isConnected && supabaseClient !== null;
  }

  /**
   * 检查用户是否已登录
   * @returns {Promise<boolean>} 是否已登录
   */
  async function checkUserLogin() {
    if (!isConnectedToSupabase()) {
      return false;
    }

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      currentUser = user;
      return user !== null;
    } catch (error) {
      console.error('[Supabase] 获取用户信息失败:', error);
      return false;
    }
  }

  /**
   * 邮箱登录
   * @param {string} email 用户邮箱
   * @param {string} password 用户密码
   * @returns {Promise<Object>} 登录结果
   */
  async function signInWithEmail(email, password) {
    if (!isConnectedToSupabase()) {
      return { success: false, error: 'Supabase 未连接' };
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      currentUser = data.user;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('[Supabase] 登录失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 邮箱注册
   * @param {string} email 用户邮箱
   * @param {string} password 用户密码
   * @returns {Promise<Object>} 注册结果
   */
  async function signUpWithEmail(email, password) {
    if (!isConnectedToSupabase()) {
      return { success: false, error: 'Supabase 未连接' };
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      currentUser = data.user;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('[Supabase] 注册失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 登出
   * @returns {Promise<Object>} 登出结果
   */
  async function signOut() {
    if (!isConnectedToSupabase()) {
      return { success: true };
    }

    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('[Supabase] 登出失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 初始化时立即执行
   */
  initSupabase();

  // 暴露全局接口
  window.supabaseClient = {
    getClient: getClient,
    getCurrentUser: getCurrentUser,
    isConnected: isConnectedToSupabase,
    checkUserLogin: checkUserLogin,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signOut: signOut
  };

})();