/**
 * dataService.js - 数据服务层
 * 负责 localStorage 读写和 Supabase 云端同步
 */

(function() {
  'use strict';

  // 本地存储键名
  const STORAGE_KEYS = {
    todos: 'workbench_todos',
    schedules: 'workbench_schedules',
    favorites: 'workbench_favorites',
    history: 'workbench_history',
    shared_links: 'workbench_shared_links',
    user: 'workbench_user'
  };

  let supabaseClient = null;
  let currentUser = null;

  // ========== 本地存储操作 ==========
  const localStorageAPI = {
    get(key) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        console.error('[DataService] localStorage get error:', e);
        return null;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('[DataService] localStorage set error:', e);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error('[DataService] localStorage remove error:', e);
        return false;
      }
    }
  };

  // ========== 数据转换：本地格式 <-> Supabase 格式 ==========
  function mapTodoToSupabase(todo) {
    return {
      id: todo.id,
      user_id: currentUser?.id,
      name: todo.name,
      type: todo.type,
      deadline: todo.deadline,
      quadrant: todo.quadrant,
      priority: todo.priority,
      partners: todo.partners || '',
      progress: todo.progress || 0,
      description: todo.description || '',
      completed: todo.completed || false,
      created_at: todo.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  function mapSupabaseTodo(row) {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      deadline: row.deadline,
      quadrant: row.quadrant,
      priority: row.priority,
      partners: row.partners || '',
      progress: row.progress || 0,
      description: row.description || '',
      completed: row.completed || false,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  function mapScheduleToSupabase(schedule) {
    return {
      id: schedule.id,
      user_id: currentUser?.id,
      date: schedule.date,
      start: schedule.start,
      end: schedule.end,
      name: schedule.name,
      parent_todo_id: schedule.parentTodoId,
      quadrant: schedule.quadrant,
      status: schedule.status || 'pending',
      progress: schedule.progress || 0,
      location: schedule.location || '',
      participants: schedule.participants || '',
      note: schedule.note || '',
      created_at: schedule.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  function mapSupabaseSchedule(row) {
    return {
      id: row.id,
      date: row.date,
      start: row.start,
      end: row.end,
      name: row.name,
      parentTodoId: row.parent_todo_id,
      quadrant: row.quadrant,
      status: row.status || 'pending',
      progress: row.progress || 0,
      location: row.location || '',
      participants: row.participants || '',
      note: row.note || '',
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  // ========== 数据服务 API ==========
  const dataService = {
    // 检查是否使用云端
    isUsingCloud() {
      return !!currentUser && !!supabaseClient;
    },

    // 获取当前用户
    getCurrentUser() {
      return currentUser;
    },

    // 设置 Supabase 客户端
    setSupabaseClient(client) {
      supabaseClient = client;
    },

    // 设置当前用户
    setCurrentUser(user) {
      currentUser = user;
      if (user) {
        localStorageAPI.set(STORAGE_KEYS.user, user);
      } else {
        localStorageAPI.remove(STORAGE_KEYS.user);
      }
    },

    // 初始化：从本地恢复用户，监听登录状态
    init() {
      // 尝试从本地恢复用户
      const savedUser = localStorageAPI.get(STORAGE_KEYS.user);
      if (savedUser) {
        currentUser = savedUser;
      }

      // 监听 Supabase 认证状态变化
      window.addEventListener('supabase-auth-change', (event) => {
        if (event.detail && event.detail.user) {
          currentUser = event.detail.user;
          localStorageAPI.set(STORAGE_KEYS.user, currentUser);
          console.log('[DataService] 用户已登录:', currentUser.email);
        } else {
          currentUser = null;
          localStorageAPI.remove(STORAGE_KEYS.user);
          console.log('[DataService] 用户已登出');
        }
      });
    },

    // ========== 待办任务 (Todos) ==========
    getLocalTodos() {
      return localStorageAPI.get(STORAGE_KEYS.todos) || [];
    },

    async getTodos() {
      if (this.isUsingCloud()) {
        const { data, error } = await supabaseClient
          .from('todos')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[DataService] 获取 todos 失败:', error);
          return this.getLocalTodos();
        }

        const todos = data.map(mapSupabaseTodo);
        // 同步到本地缓存
        localStorageAPI.set(STORAGE_KEYS.todos, todos);
        return todos;
      }
      return this.getLocalTodos();
    },

    async saveTodo(todo) {
      // 保存到本地
      const todos = this.getLocalTodos();
      const index = todos.findIndex(t => t.id === todo.id);
      if (index >= 0) {
        todos[index] = todo;
      } else {
        todos.push(todo);
      }
      localStorageAPI.set(STORAGE_KEYS.todos, todos);

      // 同步到云端
      if (this.isUsingCloud()) {
        const { error } = await supabaseClient
          .from('todos')
          .upsert(mapTodoToSupabase(todo), { onConflict: 'id' });

        if (error) {
          console.error('[DataService] 保存 todo 到云端失败:', error);
        }
      }
    },

    async saveTodos(todos) {
      localStorageAPI.set(STORAGE_KEYS.todos, todos);

      if (this.isUsingCloud()) {
        const supabaseTodos = todos.map(mapTodoToSupabase);
        const { error } = await supabaseClient
          .from('todos')
          .upsert(supabaseTodos, { onConflict: 'id' });

        if (error) {
          console.error('[DataService] 批量保存 todos 失败:', error);
        }
      }
    },

    async deleteTodo(id) {
      const todos = this.getLocalTodos().filter(t => t.id !== id);
      localStorageAPI.set(STORAGE_KEYS.todos, todos);

      if (this.isUsingCloud()) {
        const { error } = await supabaseClient
          .from('todos')
          .delete()
          .eq('id', id)
          .eq('user_id', currentUser.id);

        if (error) {
          console.error('[DataService] 删除 todo 失败:', error);
        }
      }
    },

    // ========== 日程 (Schedules) ==========
    getLocalSchedules() {
      return localStorageAPI.get(STORAGE_KEYS.schedules) || [];
    },

    async getSchedules() {
      if (this.isUsingCloud()) {
        const { data, error } = await supabaseClient
          .from('schedules')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[DataService] 获取 schedules 失败:', error);
          return this.getLocalSchedules();
        }

        const schedules = data.map(mapSupabaseSchedule);
        localStorageAPI.set(STORAGE_KEYS.schedules, schedules);
        return schedules;
      }
      return this.getLocalSchedules();
    },

    async saveSchedule(schedule) {
      const schedules = this.getLocalSchedules();
      const index = schedules.findIndex(s => s.id === schedule.id);
      if (index >= 0) {
        schedules[index] = schedule;
      } else {
        schedules.push(schedule);
      }
      localStorageAPI.set(STORAGE_KEYS.schedules, schedules);

      if (this.isUsingCloud()) {
        const { error } = await supabaseClient
          .from('schedules')
          .upsert(mapScheduleToSupabase(schedule), { onConflict: 'id' });

        if (error) {
          console.error('[DataService] 保存 schedule 到云端失败:', error);
        }
      }
    },

    async saveSchedules(schedules) {
      localStorageAPI.set(STORAGE_KEYS.schedules, schedules);

      if (this.isUsingCloud()) {
        const supabaseSchedules = schedules.map(mapScheduleToSupabase);
        const { error } = await supabaseClient
          .from('schedules')
          .upsert(supabaseSchedules, { onConflict: 'id' });

        if (error) {
          console.error('[DataService] 批量保存 schedules 失败:', error);
        }
      }
    },

    async deleteSchedule(id) {
      const schedules = this.getLocalSchedules().filter(s => s.id !== id);
      localStorageAPI.set(STORAGE_KEYS.schedules, schedules);

      if (this.isUsingCloud()) {
        const { error } = await supabaseClient
          .from('schedules')
          .delete()
          .eq('id', id)
          .eq('user_id', currentUser.id);

        if (error) {
          console.error('[DataService] 删除 schedule 失败:', error);
        }
      }
    },

    // ========== 收藏 (Favorites) ==========
    getLocalFavorites() {
      return localStorageAPI.get(STORAGE_KEYS.favorites) || [];
    },

    async getFavorites() {
      if (this.isUsingCloud()) {
        const { data, error } = await supabaseClient
          .from('favorites')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[DataService] 获取 favorites 失败:', error);
          return this.getLocalFavorites();
        }
        localStorageAPI.set(STORAGE_KEYS.favorites, data);
        return data;
      }
      return this.getLocalFavorites();
    },

    async addFavorite(item) {
      const favorites = this.getLocalFavorites();
      favorites.unshift({
        ...item,
        id: item.id || Date.now(),
        created_at: new Date().toISOString()
      });
      localStorageAPI.set(STORAGE_KEYS.favorites, favorites);

      if (this.isUsingCloud()) {
        const { error } = await supabaseClient
          .from('favorites')
          .insert({
            user_id: currentUser.id,
            item_id: item.id,
            item_type: item.type || 'news',
            item_data: item,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('[DataService] 添加 favorite 失败:', error);
        }
      }
    },

    // ========== 浏览历史 (History) ==========
    getLocalHistory() {
      return localStorageAPI.get(STORAGE_KEYS.history) || [];
    },

    async addHistory(item) {
      const history = this.getLocalHistory();
      // 去重：如果已存在，移到最前面
      const filtered = history.filter(h => h.id !== item.id);
      filtered.unshift({
        ...item,
        viewed_at: new Date().toISOString()
      });
      // 限制历史记录数量
      const limited = filtered.slice(0, 100);
      localStorageAPI.set(STORAGE_KEYS.history, limited);

      if (this.isUsingCloud()) {
        const { error } = await supabaseClient
          .from('history')
          .upsert({
            user_id: currentUser.id,
            item_id: item.id,
            item_type: item.type || 'news',
            item_data: item,
            viewed_at: new Date().toISOString()
          }, { onConflict: ['user_id', 'item_id'] });

        if (error) {
          console.error('[DataService] 添加 history 失败:', error);
        }
      }
    },

    // ========== 分享链接 (Shared Links) ==========
    getLocalSharedLinks() {
      return localStorageAPI.get(STORAGE_KEYS.shared_links) || [];
    },

    async createSharedLink(data) {
      const link = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        data: data,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
      };

      const links = this.getLocalSharedLinks();
      links.push(link);
      localStorageAPI.set(STORAGE_KEYS.shared_links, links);

      if (this.isUsingCloud()) {
        const { error } = await supabaseClient
          .from('shared_links')
          .insert({
            user_id: currentUser.id,
            link_id: link.id,
            data: data,
            created_at: link.created_at,
            expires_at: link.expires_at
          });

        if (error) {
          console.error('[DataService] 创建 shared_link 失败:', error);
        }
      }

      return link;
    },

    // ========== 数据同步 ==========
    async syncFromCloud() {
      if (!this.isUsingCloud()) {
        console.log('[DataService] 未登录，跳过云端同步');
        return false;
      }

      try {
        console.log('[DataService] 开始从云端同步数据...');
        
        const [todos, schedules, favorites, history] = await Promise.all([
          this.getTodos(),
          this.getSchedules(),
          this.getFavorites(),
          this.getLocalHistory() // history 暂时只存本地
        ]);

        console.log('[DataService] 同步完成:', {
          todos: todos.length,
          schedules: schedules.length,
          favorites: favorites.length
        });

        return true;
      } catch (error) {
        console.error('[DataService] 同步失败:', error);
        return false;
      }
    },

    async syncToCloud() {
      if (!this.isUsingCloud()) {
        console.log('[DataService] 未登录，跳过上传到云端');
        return false;
      }

      try {
        console.log('[DataService] 开始上传到云端...');
        
        const todos = this.getLocalTodos();
        const schedules = this.getLocalSchedules();
        
        if (todos.length > 0) {
          await this.saveTodos(todos);
        }
        if (schedules.length > 0) {
          await this.saveSchedules(schedules);
        }

        console.log('[DataService] 上传完成');
        return true;
      } catch (error) {
        console.error('[DataService] 上传失败:', error);
        return false;
      }
    },

    // ========== 数据导出/导入 ==========
    exportData() {
      return {
        todos: this.getLocalTodos(),
        schedules: this.getLocalSchedules(),
        favorites: this.getLocalFavorites(),
        history: this.getLocalHistory(),
        exportedAt: new Date().toISOString()
      };
    },

    importData(data) {
      if (data.todos) {
        localStorageAPI.set(STORAGE_KEYS.todos, data.todos);
      }
      if (data.schedules) {
        localStorageAPI.set(STORAGE_KEYS.schedules, data.schedules);
      }
      if (data.favorites) {
        localStorageAPI.set(STORAGE_KEYS.favorites, data.favorites);
      }
      if (data.history) {
        localStorageAPI.set(STORAGE_KEYS.history, data.history);
      }
    },

    // ========== 清空数据 ==========
    async clearAllData() {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorageAPI.remove(key);
      });

      if (this.isUsingCloud()) {
        const tables = ['todos', 'schedules', 'favorites', 'history'];
        for (const table of tables) {
          const { error } = await supabaseClient
            .from(table)
            .delete()
            .eq('user_id', currentUser.id);

          if (error) {
            console.error(`[DataService] 清空 ${table} 失败:`, error);
          }
        }
      }
    }
  };

  // 初始化
  dataService.init();

  // 暴露到全局
  window.dataService = dataService;
})();
