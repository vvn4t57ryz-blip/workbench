/**
 * 数据服务层
 * 支持 Supabase 云端同步和 localStorage 本地存储双模式
 * 自动降级：Supabase 未配置或连接失败时 fallback 到 localStorage
 */

(function() {
  'use strict';

  // 数据存储键名
  const STORAGE_KEYS = {
    todos: 'workbench_todos',
    schedules: 'workbench_schedules',
    favorites: 'workbench_favorites',
    history: 'workbench_history',
    version: 'workbench_data_version'
  };

  // 数据版本号（用于版本管理）
  const DATA_VERSION = '3';

  // 数据表名（Supabase）
  const TABLE_NAMES = {
    todos: 'todos',
    schedules: 'schedules',
    favorites: 'favorites',
    history: 'history'
  };

  /**
   * 数据服务类
   */
  class DataService {
    constructor() {
      this.useSupabase = false;
      this.currentUser = null;
      this.client = null;
      
      // 初始化时检查 Supabase 连接状态
      this.init();
    }

    /**
     * 初始化数据服务
     */
    init() {
      // 检查 Supabase 是否可用
      if (window.supabaseClient && window.supabaseClient.isConnected()) {
        this.useSupabase = true;
        this.client = window.supabaseClient.getClient();
        this.currentUser = window.supabaseClient.getCurrentUser();
        console.log('[DataService] 使用 Supabase 云端存储模式');
      } else {
        this.useSupabase = false;
        console.log('[DataService] 使用 localStorage 本地存储模式');
      }

      // 监听认证状态变化
      if (window.addEventListener) {
        window.addEventListener('supabase-auth-change', (event) => {
          this.currentUser = event.detail.user;
          console.log('[DataService] 用户状态已更新:', this.currentUser?.email || '未登录');
        });
      }

      // 检查数据版本，必要时迁移
      this.checkDataVersion();
    }

    /**
     * 检查数据版本并迁移
     */
    checkDataVersion() {
      const savedVersion = localStorage.getItem(STORAGE_KEYS.version);
      
      if (savedVersion !== DATA_VERSION) {
        console.log('[DataService] 数据版本从', savedVersion, '升级到', DATA_VERSION);
        localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
        // 可以在这里添加数据迁移逻辑
      }
    }

    /**
     * 获取用户 ID（用于数据隔离）
     * @returns {string} 用户 ID 或 'local'
     */
    getUserId() {
      if (this.useSupabase && this.currentUser) {
        return this.currentUser.id;
      }
      return 'local';
    }

    /**
     * ============ 待办任务数据操作 ============
     */

    /**
     * 获取所有待办任务
     * @returns {Promise<Array>} 待办任务数组
     */
    async getTodos() {
      if (this.useSupabase && this.currentUser) {
        try {
          const { data, error } = await this.client
            .from(TABLE_NAMES.todos)
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return this.mapSupabaseTodos(data || []);
        } catch (error) {
          console.error('[DataService] 从 Supabase 获取待办失败:', error);
          // 降级到 localStorage
          return this.getLocalTodos();
        }
      } else {
        return this.getLocalTodos();
      }
    }

    /**
     * 从 localStorage 获取待办
     * @returns {Array} 待办数组
     */
    getLocalTodos() {
      const savedTodos = localStorage.getItem(STORAGE_KEYS.todos);
      return savedTodos ? JSON.parse(savedTodos) : [];
    }

    /**
     * 保存所有待办任务
     * @param {Array} todos 待办任务数组
     * @returns {Promise<boolean>} 是否成功
     */
    async saveTodos(todos) {
      // 先保存到 localStorage（作为备份）
      localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));

      if (this.useSupabase && this.currentUser) {
        try {
          // 批量更新或插入
          for (const todo of todos) {
            const supabaseTodo = this.mapTodoToSupabase(todo);
            const { error } = await this.client
              .from(TABLE_NAMES.todos)
              .upsert(supabaseTodo, { onConflict: 'id' });

            if (error) throw error;
          }
          return true;
        } catch (error) {
          console.error('[DataService] 保存待办到 Supabase 失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * 保存单个待办任务
     * @param {Object} todo 待办任务对象
     * @returns {Promise<boolean>} 是否成功
     */
    async saveTodo(todo) {
      // 更新 localStorage
      let todos = this.getLocalTodos();
      const index = todos.findIndex(t => t.id === todo.id);
      if (index !== -1) {
        todos[index] = todo;
      } else {
        todos.push(todo);
      }
      localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));

      if (this.useSupabase && this.currentUser) {
        try {
          const supabaseTodo = this.mapTodoToSupabase(todo);
          const { error } = await this.client
            .from(TABLE_NAMES.todos)
            .upsert(supabaseTodo, { onConflict: 'id' });

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('[DataService] 保存单个待办到 Supabase 失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * 删除待办任务
     * @param {number} todoId 待办 ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteTodo(todoId) {
      // 从 localStorage 删除
      let todos = this.getLocalTodos();
      todos = todos.filter(t => t.id !== todoId);
      localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));

      if (this.useSupabase && this.currentUser) {
        try {
          const { error } = await this.client
            .from(TABLE_NAMES.todos)
            .delete()
            .eq('id', todoId)
            .eq('user_id', this.currentUser.id);

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('[DataService] 从 Supabase 删除待办失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * ============ 日程数据操作 ============
     */

    /**
     * 获取所有日程
     * @returns {Promise<Array>} 日程数组
     */
    async getSchedules() {
      if (this.useSupabase && this.currentUser) {
        try {
          const { data, error } = await this.client
            .from(TABLE_NAMES.schedules)
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('date', { ascending: true })
            .order('start', { ascending: true });

          if (error) throw error;
          return this.mapSupabaseSchedules(data || []);
        } catch (error) {
          console.error('[DataService] 从 Supabase 获取日程失败:', error);
          return this.getLocalSchedules();
        }
      } else {
        return this.getLocalSchedules();
      }
    }

    /**
     * 从 localStorage 获取日程
     * @returns {Array} 日程数组
     */
    getLocalSchedules() {
      const savedSchedules = localStorage.getItem(STORAGE_KEYS.schedules);
      return savedSchedules ? JSON.parse(savedSchedules) : [];
    }

    /**
     * 保存所有日程
     * @param {Array} schedules 日程数组
     * @returns {Promise<boolean>} 是否成功
     */
    async saveSchedules(schedules) {
      localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));

      if (this.useSupabase && this.currentUser) {
        try {
          for (const schedule of schedules) {
            const supabaseSchedule = this.mapScheduleToSupabase(schedule);
            const { error } = await this.client
              .from(TABLE_NAMES.schedules)
              .upsert(supabaseSchedule, { onConflict: 'id' });

            if (error) throw error;
          }
          return true;
        } catch (error) {
          console.error('[DataService] 保存日程到 Supabase 失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * 保存单个日程
     * @param {Object} schedule 日程对象
     * @returns {Promise<boolean>} 是否成功
     */
    async saveSchedule(schedule) {
      let schedules = this.getLocalSchedules();
      const index = schedules.findIndex(s => s.id === schedule.id);
      if (index !== -1) {
        schedules[index] = schedule;
      } else {
        schedules.push(schedule);
      }
      localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));

      if (this.useSupabase && this.currentUser) {
        try {
          const supabaseSchedule = this.mapScheduleToSupabase(schedule);
          const { error } = await this.client
            .from(TABLE_NAMES.schedules)
            .upsert(supabaseSchedule, { onConflict: 'id' });

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('[DataService] 保存单个日程到 Supabase 失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * 删除日程
     * @param {number} scheduleId 日程 ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteSchedule(scheduleId) {
      let schedules = this.getLocalSchedules();
      schedules = schedules.filter(s => s.id !== scheduleId);
      localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));

      if (this.useSupabase && this.currentUser) {
        try {
          const { error } = await this.client
            .from(TABLE_NAMES.schedules)
            .delete()
            .eq('id', scheduleId)
            .eq('user_id', this.currentUser.id);

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('[DataService] 从 Supabase 删除日程失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * ============ 收藏数据操作 ============
     */

    /**
     * 获取所有收藏
     * @returns {Promise<Array>} 收藏数组
     */
    async getFavorites() {
      if (this.useSupabase && this.currentUser) {
        try {
          const { data, error } = await this.client
            .from(TABLE_NAMES.favorites)
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DataService] 从 Supabase 获取收藏失败:', error);
          return this.getLocalFavorites();
        }
      } else {
        return this.getLocalFavorites();
      }
    }

    /**
     * 从 localStorage 获取收藏
     * @returns {Array} 收藏数组
     */
    getLocalFavorites() {
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.favorites);
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    }

    /**
     * 保存收藏
     * @param {Object} favorite 收藏对象
     * @returns {Promise<boolean>} 是否成功
     */
    async saveFavorite(favorite) {
      let favorites = this.getLocalFavorites();
      favorites.push(favorite);
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));

      if (this.useSupabase && this.currentUser) {
        try {
          const { error } = await this.client
            .from(TABLE_NAMES.favorites)
            .insert({
              user_id: this.currentUser.id,
              news_id: favorite.news_id,
              created_at: new Date().toISOString()
            });

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('[DataService] 保存收藏到 Supabase 失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * 删除收藏
     * @param {number} newsId 资讯 ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteFavorite(newsId) {
      let favorites = this.getLocalFavorites();
      favorites = favorites.filter(f => f.news_id !== newsId);
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));

      if (this.useSupabase && this.currentUser) {
        try {
          const { error } = await this.client
            .from(TABLE_NAMES.favorites)
            .delete()
            .eq('news_id', newsId)
            .eq('user_id', this.currentUser.id);

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('[DataService] 从 Supabase 删除收藏失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * ============ 历史记录数据操作 ============
     */

    /**
     * 获取所有历史记录
     * @returns {Promise<Array>} 历史数组
     */
    async getHistory() {
      if (this.useSupabase && this.currentUser) {
        try {
          const { data, error } = await this.client
            .from(TABLE_NAMES.history)
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('viewed_at', { ascending: false })
            .limit(50);

          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DataService] 从 Supabase 获取历史失败:', error);
          return this.getLocalHistory();
        }
      } else {
        return this.getLocalHistory();
      }
    }

    /**
     * 从 localStorage 获取历史记录
     * @returns {Array} 历史数组
     */
    getLocalHistory() {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.history);
      return savedHistory ? JSON.parse(savedHistory) : [];
    }

    /**
     * 保存历史记录
     * @param {Object} historyItem 历史记录对象
     * @returns {Promise<boolean>} 是否成功
     */
    async saveHistory(historyItem) {
      let history = this.getLocalHistory();
      // 移除旧的相同记录
      history = history.filter(h => h.news_id !== historyItem.news_id);
      history.unshift(historyItem);
      // 限制数量
      if (history.length > 50) {
        history = history.slice(0, 50);
      }
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));

      if (this.useSupabase && this.currentUser) {
        try {
          // 删除旧记录
          await this.client
            .from(TABLE_NAMES.history)
            .delete()
            .eq('news_id', historyItem.news_id)
            .eq('user_id', this.currentUser.id);

          // 插入新记录
          const { error } = await this.client
            .from(TABLE_NAMES.history)
            .insert({
              user_id: this.currentUser.id,
              news_id: historyItem.news_id,
              viewed_at: new Date().toISOString()
            });

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('[DataService] 保存历史到 Supabase 失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * 清空历史记录
     * @returns {Promise<boolean>} 是否成功
     */
    async clearHistory() {
      localStorage.removeItem(STORAGE_KEYS.history);

      if (this.useSupabase && this.currentUser) {
        try {
          const { error } = await this.client
            .from(TABLE_NAMES.history)
            .delete()
            .eq('user_id', this.currentUser.id);

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('[DataService] 清空 Supabase 历史失败:', error);
          return false;
        }
      }
      return true;
    }

    /**
     * ============ 数据映射函数 ============
     */

    /**
     * 将 Supabase 待办格式映射为本地格式
     * @param {Array} supabaseTodos Supabase 待办数组
     * @returns {Array} 本地格式待办数组
     */
    mapSupabaseTodos(supabaseTodos) {
      return supabaseTodos.map(st => ({
        id: st.id,
        name: st.name,
        type: st.type || 'week',
        deadline: st.deadline,
        quadrant: st.quadrant || 'normal-normal',
        priority: st.priority || 'medium',
        partners: st.partners || '',
        progress: st.progress || 0,
        description: st.description || '',
        completed: st.completed || false,
        created_at: st.created_at,
        updated_at: st.updated_at
      }));
    }

    /**
     * 将本地待办格式映射为 Supabase 格式
     * @param {Object} todo 本地待办对象
     * @returns {Object} Supabase 格式待办
     */
    mapTodoToSupabase(todo) {
      return {
        id: todo.id,
        user_id: this.currentUser.id,
        name: todo.name,
        type: todo.type || 'week',
        deadline: todo.deadline,
        quadrant: todo.quadrant || 'normal-normal',
        priority: todo.priority || 'medium',
        partners: todo.partners || '',
        progress: todo.progress || 0,
        description: todo.description || '',
        completed: todo.completed || false,
        created_at: todo.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    /**
     * 将 Supabase 日程格式映射为本地格式
     * @param {Array} supabaseSchedules Supabase 日程数组
     * @returns {Array} 本地格式日程数组
     */
    mapSupabaseSchedules(supabaseSchedules) {
      return supabaseSchedules.map(ss => ({
        id: ss.id,
        date: ss.date,
        start: ss.start,
        end: ss.end,
        name: ss.name,
        parentTodoId: ss.parent_todo_id,
        quadrant: ss.quadrant || 'normal-normal',
        status: ss.status || 'pending',
        progress: ss.progress || 0,
        location: ss.location || '',
        participants: ss.participants || '',
        note: ss.note || '',
        created_at: ss.created_at,
        updated_at: ss.updated_at
      }));
    }

    /**
     * 将本地日程格式映射为 Supabase 格式
     * @param {Object} schedule 本地日程对象
     * @returns {Object} Supabase 格式日程
     */
    mapScheduleToSupabase(schedule) {
      return {
        id: schedule.id,
        user_id: this.currentUser.id,
        date: schedule.date,
        start: schedule.start,
        end: schedule.end,
        name: schedule.name,
        parent_todo_id: schedule.parentTodoId,
        quadrant: schedule.quadrant || 'normal-normal',
        status: schedule.status || 'pending',
        progress: schedule.progress || 0,
        location: schedule.location || '',
        participants: schedule.participants || '',
        note: schedule.note || '',
        created_at: schedule.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    /**
     * ============ 工具方法 ============
     */

    /**
     * 检查是否使用云端存储
     * @returns {boolean} 是否使用云端
     */
    isUsingCloud() {
      return this.useSupabase && this.currentUser !== null;
    }

    /**
     * 同步云端数据到本地（用于登录后同步）
     * @returns {Promise<boolean>} 是否成功
     */
    async syncFromCloud() {
      if (!this.isUsingCloud()) {
        console.log('[DataService] 未连接云端，无法同步');
        return false;
      }

      try {
        console.log('[DataService] 开始从云端同步数据...');
        
        // 获取云端数据
        const todos = await this.getTodos();
        const schedules = await this.getSchedules();
        const favorites = await this.getFavorites();
        const history = await this.getHistory();

        // 保存到本地
        localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
        localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules));
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));

        console.log('[DataService] 云端数据同步完成');
        return true;
      } catch (error) {
        console.error('[DataService] 云端数据同步失败:', error);
        return false;
      }
    }

    /**
     * 同步本地数据到云端（用于上传本地数据）
     * @returns {Promise<boolean>} 是否成功
     */
    async syncToCloud() {
      if (!this.isUsingCloud()) {
        console.log('[DataService] 未连接云端，无法同步');
        return false;
      }

      try {
        console.log('[DataService] 开始将本地数据同步到云端...');
        
        // 获取本地数据
        const todos = this.getLocalTodos();
        const schedules = this.getLocalSchedules();

        // 上传到云端
        await this.saveTodos(todos);
        await this.saveSchedules(schedules);

        console.log('[DataService] 本地数据已同步到云端');
        return true;
      } catch (error) {
        console.error('[DataService] 本地数据同步到云端失败:', error);
        return false;
      }
    }

    /**
     * 清空所有数据（云端和本地）
     * @returns {Promise<boolean>} 是否成功
     */
    async clearAllData() {
      // 清空本地
      localStorage.removeItem(STORAGE_KEYS.todos);
      localStorage.removeItem(STORAGE_KEYS.schedules);
      localStorage.removeItem(STORAGE_KEYS.favorites);
      localStorage.removeItem(STORAGE_KEYS.history);

      if (this.useSupabase && this.currentUser) {
        try {
          // 清空云端数据
          await this.client.from(TABLE_NAMES.todos).delete().eq('user_id', this.currentUser.id);
          await this.client.from(TABLE_NAMES.schedules).delete().eq('user_id', this.currentUser.id);
          await this.client.from(TABLE_NAMES.favorites).delete().eq('user_id', this.currentUser.id);
          await this.client.from(TABLE_NAMES.history).delete().eq('user_id', this.currentUser.id);
          
          return true;
        } catch (error) {
          console.error('[DataService] 清空云端数据失败:', error);
          return false;
        }
      }
      return true;
    }
  }

  // 创建全局实例
  const dataService = new DataService();

  // 暴露全局接口
  window.dataService = dataService;

})();