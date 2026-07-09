/**
 * 效率工作台 - 主交互脚本
 * 简约商务风格 · 暖橙色主题
 */

(function () {
  'use strict';

  // ========== 全局数据 ==========
  let todos = [];
  let schedules = [];
  let currentGanttDate = new Date();
  let currentCategory = '全部';
  let notificationList = [];
  let notifiedTasks = new Set();

  // 资讯数据 - 真实热点新闻聚合
  const newsData = [
    {
      id: 1,
      title: '2026年短剧产业市场规模预计突破1277亿元，用户规模达6.96亿',
      category: '热点追踪',
      source: '新浪财经',
      sourceUrl: 'https://k.sina.cn/article_7857201856_1d45362c001907o7d6.html',
      time: '2小时前',
      reads: '3.2万',
      content: '<p>最新市场调研数据显示，2026年短剧产业市场规模有望突破1277亿元，同比增长超过40%。截至2026年1月，全网短剧用户已达6.96亿，占网民总数近七成。</p><p>短剧特指单集时长5-15分钟、剧情紧凑、节奏明快、适配碎片化场景的新型内容形式。随着用户付费意愿提升和内容质量升级，短剧正从流量风口走向产业蓝海。</p><p>各大平台纷纷加码短剧赛道，腾讯、爱奇艺、抖音等头部平台均已建立完整的短剧内容生态，形成了从创作到分发的完整产业链。</p>'
    },
    {
      id: 2,
      title: '2026 AI短剧新浪潮：Q1全网播放量突破180亿次',
      category: '短剧动态',
      source: '今日头条',
      sourceUrl: 'http://m.toutiao.com/group/7659619210422796838/',
      time: '5小时前',
      reads: '1.8万',
      content: '<p>2026年上半年，AI短剧赛道迎来爆发式增长。根据抖音精选、DataEye研究院等平台的短剧数据统计，仅第一季度，AI辅助生成的短剧作品全网累计播放量已突破180亿次，较去年同期增长超过300%。</p><p>AI技术正在从剧本生成、数字人出演、后期制作等多个环节重塑短剧生产链条，大幅降低制作成本，提高生产效率。</p><p>业内专家预测，AI短剧将成为2026年内容产业最具爆发力的细分领域之一。</p>'
    },
    {
      id: 3,
      title: '智源研究院发布《2026十大AI技术趋势》报告',
      category: '热点追踪',
      source: '今日头条',
      sourceUrl: 'http://m.toutiao.com/group/7592931740562227748/',
      time: '1天前',
      reads: '5.6万',
      content: '<p>2026年1月8日，北京智源人工智能研究院发布《2026十大AI技术趋势》年度报告。报告指出，2026年将是AI从数字世界迈入物理世界、从技术演示走向规模价值的关键分水岭。</p><p>十大趋势涵盖大模型认知能力突破、多模态理解与生成、AI Agent自主进化、具身智能、AI安全与对齐等核心方向，为行业发展指明了方向。</p><p>报告强调，AI技术正在从"预测词汇"走向"预测世界状态"，将深刻改变各行业的生产方式和生活方式。</p>'
    },
    {
      id: 4,
      title: '2026年广告行业营销数字化转型趋势报告发布',
      category: '行业报告',
      source: '原创力文档',
      sourceUrl: 'https://m.book118.com/html/2026/0122/7143060143011043.shtm',
      time: '3天前',
      reads: '8.2k',
      content: '<p>《2026年广告行业营销数字化转型趋势报告》深入分析了人工智能技术的深度应用、大数据与精准营销的融合、全渠道整合营销、内容营销升级等核心趋势。</p><p>报告指出，5G技术全面商用和人工智能深度渗透正在推动营销行业发生深刻变革，客户关系管理已从附属环节上升为核心组成部分。</p><p>企业需要拥抱数据驱动营销、智能营销自动化、个性化客户体验等新策略，才能在数字化时代保持竞争力。</p>'
    },
    {
      id: 5,
      title: '美媒预测2026年人工智能八大趋势',
      category: '热点追踪',
      source: '参考消息',
      sourceUrl: 'http://m.toutiao.com/group/7556930670967128628/',
      time: '1周前',
      reads: '12.5万',
      content: '<p>美国《福布斯》杂志网站刊登知名未来学家伯纳德·马尔的文章，预测了2026年人工智能的八大趋势，包括生成式AI的普及、AI与边缘计算融合、AI伦理与监管加强、AI在医疗健康领域的突破应用等。</p><p>文章强调，AI正在从实验室走向产业应用，企业和个人都需要做好准备，迎接人工智能时代的到来。</p><p>这八大趋势涵盖了技术、产业、伦理等多个层面，为我们描绘了AI未来发展的清晰图景。</p>'
    },
    {
      id: 6,
      title: '2026年6月创业项目趋势：AI短视频、短剧分销成热门',
      category: '营销灵感',
      source: '今日头条',
      sourceUrl: 'http://m.toutiao.com/group/7657267999002460735/',
      time: '1周前',
      reads: '4.3万',
      content: '<p>中创网2026年6月最新上架项目趋势显示，当前创业方向主要集中在AI辅助短视频批量制作、本地商家同城引流、小红书虚拟电商运营、抖音短剧分销等领域。</p><p>这些项目整体偏向轻资产运营，利用AI技术降低创作门槛，通过内容平台实现流量变现，适合个人和小团队创业。</p><p>短剧分销模式尤其受到关注，随着短剧市场的爆发，分销渠道成为连接内容创作者和用户的重要桥梁。</p>'
    },
    {
      id: 7,
      title: '2026国际人工智能大会开幕，AI智能体应用成焦点',
      category: '热点追踪',
      source: '今日头条',
      sourceUrl: 'http://m.toutiao.com/group/7596322597474763273/',
      time: '2周前',
      reads: '9.8万',
      content: '<p>2026年1月16日，2026国际人工智能大会在武汉隆重开幕，聚焦AI技术与产业深度融合的新趋势与新机遇。</p><p>大会期间，多家企业发布了最新的AI智能体应用产品，展示了AI在智能客服、智能办公、智能营销等领域的创新应用。</p><p>AI智能体正在成为企业数字化转型的核心驱动力，能够自主完成复杂任务，为企业降本增效。</p>'
    },
    {
      id: 8,
      title: '2026年互联网影视行业市场分析与发展趋势报告',
      category: '行业报告',
      source: '原创力文档',
      sourceUrl: 'https://m.book118.com/html/2026/0706/6143205223012154.shtm',
      time: '3周前',
      reads: '6.1k',
      content: '<p>《2026年互联网影视行业市场分析与发展趋势报告》全面分析了市场概述、竞争格局、行业痛点和发展趋势，为从业者提供了重要参考。</p><p>报告指出，互联网影视行业正在经历从流量驱动到内容驱动的转型，优质内容和精细化运营成为竞争关键。</p><p>政策监管环境的完善也为行业健康发展提供了保障，行业规范化、内容精品化是未来发展的主旋律。</p>'
    }
  ];

  // 初始化数据（使用 dataService）
  async function initData() {
    // 检查 dataService 是否可用
    if (!window.dataService) {
      console.error('[App] dataService 未初始化');
      return;
    }

    // 等待 Supabase 初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));

    // 如果用户已登录，尝试从云端同步数据
    if (window.dataService.isUsingCloud()) {
      console.log('[App] 用户已登录，从云端获取数据');
      todos = await window.dataService.getTodos() || [];
      schedules = await window.dataService.getSchedules() || [];
    } else {
      // 使用本地数据
      console.log('[App] 使用本地数据');
      todos = window.dataService.getLocalTodos() || [];
      schedules = window.dataService.getLocalSchedules() || [];
    }

    // 数据迁移：修复之前被错误标记为完成的母任务
    let dataFixed = false;
    todos.forEach(todo => {
      const hasChildSchedules = schedules.some(s => s.parentTodoId === todo.id);
      if (hasChildSchedules && todo.completed && todo.progress >= 100) {
        const childSchedules = schedules.filter(s => s.parentTodoId === todo.id);
        const allChildCompleted = childSchedules.every(s => s.progress >= 100);
        if (!allChildCompleted) {
          todo.completed = false;
          dataFixed = true;
        }
      }
    });
    if (dataFixed) {
      await window.dataService.saveTodos(todos);
      console.log('[App] 已修复被错误标记为完成的母任务');
    }

    // 如果没有数据，初始化默认数据
    if (todos.length === 0) {
      todos = [
        { id: 1, name: '完成竞品分析报告', type: 'day', deadline: '2026-07-07T18:00', quadrant: 'urgent-important', priority: 'high', partners: '张三', progress: 100, description: '分析市场上5款竞品产品的功能和定价策略', completed: true },
        { id: 2, name: '短剧脚本审核', type: 'day', deadline: '2026-07-07T17:00', quadrant: 'normal-important', priority: 'medium', partners: '李四', progress: 60, description: '审核3部新短剧脚本，给出修改意见', completed: false },
        { id: 3, name: '整理营销素材库', type: 'week', deadline: '2026-07-08T12:00', quadrant: 'normal-normal', priority: 'medium', partners: '', progress: 30, description: '整理Q3营销活动所需的图片和视频素材', completed: false },
        { id: 4, name: '跟进客户反馈', type: 'day', deadline: '2026-07-07T16:00', quadrant: 'urgent-important', priority: 'high', partners: '王五', progress: 10, description: '跟进上周客户提出的5条产品建议', completed: false },
        { id: 5, name: '周报汇总', type: 'week', deadline: '2026-07-07T20:00', quadrant: 'urgent-normal', priority: 'low', partners: '', progress: 0, description: '整理本周工作进展，撰写周报', completed: false },
        { id: 6, name: '团队周会准备', type: 'week', deadline: '2026-07-08T09:00', quadrant: 'normal-important', priority: 'medium', partners: '', progress: 20, description: '准备下周团队周会的演示PPT', completed: false },
        { id: 7, name: '用户调研分析', type: 'month', deadline: '2026-07-09T18:00', quadrant: 'urgent-important', priority: 'high', partners: '赵六', progress: 0, description: '分析100份用户调研问卷数据', completed: false },
        { id: 8, name: '文档更新', type: 'month', deadline: '2026-07-10T12:00', quadrant: 'normal-normal', priority: 'low', partners: '', progress: 0, description: '更新产品使用文档', completed: false }
      ];
      await window.dataService.saveTodos(todos);
    }

    if (schedules.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      schedules = [
        { id: 1, date: today, start: '10:00', end: '11:00', name: '产品周会', parentTodoId: 1, quadrant: 'urgent-important', location: '会议室 A301', participants: '张三、李四、王五', note: '讨论Q3产品规划', status: 'completed', progress: 100 },
        { id: 2, date: today, start: '14:00', end: '15:30', name: '营销创意脑暴会', parentTodoId: 3, quadrant: 'normal-important', location: '线上会议', participants: '全组人员', note: '讨论下半年营销活动方案', status: 'in-progress', progress: 45 },
        { id: 3, date: new Date(Date.now() + 86400000).toISOString().split('T')[0], start: '09:30', end: '10:30', name: '客户需求沟通', parentTodoId: 4, quadrant: 'urgent-important', location: '客户办公室', participants: '张三、客户方', note: '跟进新项目需求', status: 'pending', progress: 0 },
        { id: 4, date: new Date(Date.now() + 86400000).toISOString().split('T')[0], start: '15:00', end: '16:00', name: '技术评审', parentTodoId: 7, quadrant: 'normal-important', location: '会议室 B202', participants: '研发团队', note: '评审新功能技术方案', status: 'pending', progress: 0 },
        { id: 5, date: new Date(Date.now() + 172800000).toISOString().split('T')[0], start: '11:00', end: '12:00', name: '项目里程碑评审', parentTodoId: 6, quadrant: 'urgent-important', location: '大会议室', participants: '全体成员', note: 'Q2项目进度验收', status: 'pending', progress: 0 },
        { id: 6, date: new Date(Date.now() + 259200000).toISOString().split('T')[0], start: '14:00', end: '16:00', name: '跨部门协作会议', parentTodoId: null, quadrant: 'normal-normal', location: '线上会议', participants: '产品、研发、设计', note: '讨论协作流程优化', status: 'pending', progress: 0 }
      ];
      await window.dataService.saveSchedules(schedules);
    }
  }

  // 保存数据（使用 dataService）
  async function saveTodos() {
    if (window.dataService) {
      await window.dataService.saveTodos(todos);
    } else {
      localStorage.setItem('workbench_todos', JSON.stringify(todos));
    }
    updateStats();
    updateWarningBadge();
    renderTodoList();
    renderTimeline();
    renderWarningQuadrants();
  }

  async function saveSchedules() {
    if (window.dataService) {
      await window.dataService.saveSchedules(schedules);
    } else {
      localStorage.setItem('workbench_schedules', JSON.stringify(schedules));
    }
    renderGanttChart();
    updateStats();
    updateWarningBadge();
    renderTimeline();
    renderWarningQuadrants();
  }

  // ========== 初始化 Lucide 图标 ==========
  function initIcons() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  // ========== 动态问候语 ==========
  function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '你好';

    if (hour >= 5 && hour < 12) {
      greeting = '早上好';
    } else if (hour >= 12 && hour < 14) {
      greeting = '中午好';
    } else if (hour >= 14 && hour < 18) {
      greeting = '下午好';
    } else if (hour >= 18 && hour < 22) {
      greeting = '晚上好';
    } else {
      greeting = '夜深了';
    }

    const greetingEl = document.getElementById('greetingText');
    if (greetingEl) {
      greetingEl.textContent = greeting;
    }
  }

  // ========== 动态日期 ==========
  function updateDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];

    const dateEl = document.getElementById('headerDate');
    if (dateEl) {
      dateEl.textContent = `${year}年${month}月${day}日 · ${weekday}`;
    }
  }

  // ========== 页面切换 ==========
  function switchPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      if (page.getAttribute('data-page') === pageName) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-bar .tab-item').forEach(item => {
      if (item.getAttribute('onclick')?.includes(pageName)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      if (item.getAttribute('data-page') === pageName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    initIcons();

    if (pageName === 'home') {
      animateProgressBars();
    }
    if (pageName === 'dashboard') {
      renderNewsList(newsData);
    }
  }

  // ========== 统计更新 ==========
  function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const totalTodos = todos.length;
    const completedTodos = todos.filter(t => t.completed);
    const completedCount = completedTodos.length;
    const todaySchedules = schedules.filter(s => s.date === today);
    const rate = totalTodos > 0 ? ((completedCount / totalTodos) * 100).toFixed(1) : 0;

    document.getElementById('statTodos').textContent = totalTodos;
    document.getElementById('statCompleted').textContent = completedCount;
    document.getElementById('statSchedules').textContent = todaySchedules.length;

    document.getElementById('todoCount').textContent = totalTodos;
    document.getElementById('scheduleCount').textContent = todaySchedules.length;

    document.getElementById('todoListCount').textContent = totalTodos;
    document.getElementById('todoListCompleted').textContent = completedCount;

    document.getElementById('profileTotalTodos').textContent = totalTodos;
    document.getElementById('profileCompleted').textContent = completedCount;
    document.getElementById('profileRate').textContent = rate + '%';

    const progressPercent = totalTodos > 0 ? ((completedCount / totalTodos) * 100).toFixed(1) : 0;
    document.getElementById('todoProgressPercent').textContent = progressPercent + '%';
    document.getElementById('todoProgressBar').style.width = progressPercent + '%';
    document.getElementById('todoProgressText').textContent = `${completedCount}/${totalTodos} 项已完成 · 稳步推进中`;
    
    document.getElementById('statsTodoCount').textContent = totalTodos;
    document.getElementById('statsCompletedCount').textContent = completedCount;
    document.getElementById('statsScheduleCount').textContent = todaySchedules.length;
    document.getElementById('statsRate').textContent = rate + '%';

    const todayScheduleCount = todaySchedules.length;
    const meetingCount = todaySchedules.filter(s => s.name.includes('会议') || s.name.includes('开会')).length;
    document.getElementById('scheduleStatusText').textContent = `今日 ${todayScheduleCount} 项安排 · ${todayScheduleCount === 0 ? '今日空闲' : '日程充实'}`;
    
    if (meetingCount > 0) {
      document.getElementById('scheduleMeetingText').textContent = `${meetingCount}场会议待参加`;
    } else {
      document.getElementById('scheduleMeetingText').textContent = todayScheduleCount > 0 ? '今日有日程安排' : '今日无会议';
    }

    const meetingEls = document.getElementById('scheduleTimesContainer');
    if (meetingEls) {
      if (todaySchedules.length > 0) {
        const sortedSchedules = [...todaySchedules].sort((a, b) => a.start.localeCompare(b.start));
        const displayCount = Math.min(sortedSchedules.length, 3);
        const colors = ['bg-info-100 text-info-600', 'bg-brand-100 text-brand-600', 'bg-success-100 text-success-600'];
        
        meetingEls.innerHTML = '';
        for (let i = 0; i < displayCount; i++) {
          const schedule = sortedSchedules[i];
          const time = schedule.start.slice(0, 5);
          const colorClass = colors[i % colors.length];
          const div = document.createElement('div');
          div.className = `w-7 h-7 rounded-full ${colorClass} border-2 border-white flex items-center justify-center`;
          div.innerHTML = `<span class="text-[9px] font-medium">${time}</span>`;
          meetingEls.appendChild(div);
        }
      } else {
        meetingEls.innerHTML = '';
      }
    }
  }

  // ========== 进度预警计算 ==========
  function calculateWarnings() {
    const now = new Date();
    const warnings = [];
    
    const incompleteTodos = todos.filter(t => !t.completed);
    
    incompleteTodos.forEach(todo => {
      if (!todo.deadline) return;
      
      const deadline = new Date(todo.deadline);
      const hoursToDeadline = (deadline - now) / (1000 * 60 * 60);
      const progress = todo.progress || 0;
      
      let isUrgent = false;
      let isImportant = false;
      
      if (todo.quadrant) {
        isUrgent = todo.quadrant.includes('urgent');
        isImportant = todo.quadrant.includes('important');
      } else {
        if (hoursToDeadline < 24) {
          isUrgent = true;
        } else if (hoursToDeadline < 72 && progress < 50) {
          isUrgent = true;
        }
        
        if (todo.priority === 'high' || progress < 20) {
          isImportant = true;
        }
      }
      
      if (progress < 80 && hoursToDeadline < 168) {
        warnings.push({
          type: 'todo',
          id: todo.id,
          name: todo.name,
          deadline: todo.deadline,
          progress: progress,
          priority: todo.priority,
          partners: todo.partners,
          isUrgent: isUrgent,
          isImportant: isImportant,
          hoursToDeadline: hoursToDeadline
        });
      }
    });
    
    const today = now.toISOString().split('T')[0];
    
    const warningTodoIds = new Set(warnings.map(w => w.id));
    
    schedules.forEach(schedule => {
      if (schedule.status === 'completed' || schedule.status === 'cancelled') return;
      
      if (schedule.parentTodoId && warningTodoIds.has(schedule.parentTodoId)) {
        return;
      }
      
      const scheduleDate = schedule.date;
      if (!scheduleDate) return;
      
      const scheduleDateTime = new Date(scheduleDate + 'T' + (schedule.start || '00:00'));
      const hoursToSchedule = (scheduleDateTime - now) / (1000 * 60 * 60);
      
      if (hoursToSchedule > 168) return;
      
      const progress = schedule.progress || 0;
      
      let isUrgent = false;
      let isImportant = false;
      
      if (schedule.quadrant) {
        isUrgent = schedule.quadrant.includes('urgent');
        isImportant = schedule.quadrant.includes('important');
      } else {
        isUrgent = hoursToSchedule < 24;
        isImportant = progress < 30;
      }
      
      if (progress < 80) {
        warnings.push({
          type: 'schedule',
          id: schedule.id,
          name: schedule.name,
          deadline: schedule.date + 'T' + schedule.start,
          progress: progress,
          priority: 'medium',
          partners: schedule.participants,
          isUrgent: isUrgent,
          isImportant: isImportant,
          hoursToDeadline: hoursToSchedule
        });
      }
    });
    
    return warnings;
  }

  function updateWarningBadge() {
    const warnings = calculateWarnings();
    const count = warnings.length;
    
    document.getElementById('warningCount').textContent = count;
    document.getElementById('warningDesc').textContent = count > 0 ? count + '项任务需关注' : '暂无预警';
    
    const badge = document.getElementById('warningBadge');
    const bellBadge = document.getElementById('bellBadge');
    
    if (count > 0) {
      badge.style.display = 'flex';
      if (bellBadge) bellBadge.style.display = 'block';
    } else {
      badge.style.display = 'none';
      if (bellBadge) bellBadge.style.display = 'none';
    }
    
    checkNewWarnings(warnings);
    
    return warnings;
  }

  function checkNewWarnings(warnings) {
    warnings.forEach(warning => {
      const key = warning.type + '_' + warning.id;
      if (!notifiedTasks.has(key)) {
        notifiedTasks.add(key);
        if (warning.isUrgent && warning.isImportant) {
          showNotification(`⚠️ ${warning.name} - 进度滞后需关注`, warning.type, warning.id);
        }
      }
    });
  }

  function renderWarningQuadrants() {
    const warnings = calculateWarnings();
    
    const q1 = warnings.filter(w => w.isUrgent && w.isImportant);
    const q2 = warnings.filter(w => !w.isUrgent && w.isImportant);
    const q3 = warnings.filter(w => w.isUrgent && !w.isImportant);
    const q4 = warnings.filter(w => !w.isUrgent && !w.isImportant);
    
    document.getElementById('q1Count').textContent = q1.length;
    document.getElementById('q2Count').textContent = q2.length;
    document.getElementById('q3Count').textContent = q3.length;
    document.getElementById('q4Count').textContent = q4.length;
    document.getElementById('totalWarningCount').textContent = warnings.length;
    
    renderQuadrantItems('q1Content', q1);
    renderQuadrantItems('q2Content', q2);
    renderQuadrantItems('q3Content', q3);
    renderQuadrantItems('q4Content', q4);
  }

  function renderQuadrantItems(containerId, items) {
    const container = document.getElementById(containerId);

    if (items.length === 0) {
      container.innerHTML = '<div class="quadrant-empty">暂无任务</div>';
      return;
    }

    container.innerHTML = items.map(item => {
      let deadlineText;
      const hours = Math.round(item.hoursToDeadline);
      if (hours < 0) {
        deadlineText = '已逾期' + Math.abs(hours) + '小时';
      } else if (hours < 24) {
        deadlineText = hours + '小时后截止';
      } else {
        deadlineText = Math.round(hours / 24) + '天后截止';
      }
      
      return `
        <div class="quadrant-item" onclick="handleWarningItemClick('${item.type}', ${item.id})">
          <div class="quadrant-item-title">${item.name}</div>
          <div class="quadrant-item-meta">
            <span>${deadlineText}</span>
            <span>·</span>
            <span>进度 ${item.progress}%</span>
          </div>
          <div class="quadrant-item-progress">
            <div class="quadrant-item-progress-fill" style="width: ${item.progress}%; ${item.progress < 20 ? 'background: #EF4444;' : item.progress < 50 ? 'background: #E8C15A;' : 'background: #5BB88C;'}"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function handleWarningItemClick(type, id) {
    if (event) event.stopPropagation();
    closeModal('warningModal');
    setTimeout(function() {
      if (type === 'todo') {
        openTodoEditModal(id);
      } else {
        openScheduleEditModal(id);
      }
    }, 50);
  }

  // ========== 时间线渲染 ==========
  function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const todayTodos = todos.filter(t => !t.completed).slice(0, 4);
    const todaySchedules = schedules.filter(s => s.date === today).slice(0, 3);
    
    const items = [
      ...todayTodos.map(t => ({ ...t, type: 'todo' })),
      ...todaySchedules.map(s => ({ ...s, type: 'schedule' }))
    ].sort((a, b) => {
      if (a.type === 'schedule' && b.type === 'schedule') {
        return a.start.localeCompare(b.start);
      }
      if (a.type === 'schedule') return -1;
      return 1;
    });

    if (items.length === 0) {
      container.innerHTML = '<div class="p-8 text-center text-ink-400"><i data-lucide="calendar-clock" class="w-12 h-12 mx-auto mb-3 opacity-50"></i><p class="text-sm">暂无动态</p></div>';
      initIcons();
      return;
    }

    container.innerHTML = items.map((item, index) => {
      const isLast = index === items.length - 1;
      if (item.type === 'todo') {
        return `
          <div class="timeline-item flex gap-4 p-4 hover:bg-ink-50/50 transition-colors cursor-pointer" onclick="toggleTodo(${item.id})">
            <div class="flex flex-col items-center">
              <div class="w-2 h-2 rounded-full bg-success-500 mt-1.5"></div>
              ${!isLast ? '<div class="w-px flex-1 bg-ink-100 mt-1.5"></div>' : ''}
            </div>
            <div class="flex-1 pb-1">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="text-sm font-medium text-ink-900">${item.name}</h4>
                  <p class="text-xs text-ink-400 mt-1">待办 · 内容运营</p>
                </div>
                <span class="text-xs text-ink-400 whitespace-nowrap">${item.deadline?.split('T')[1]?.substring(0, 5) || '--:--'}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="timeline-item flex gap-4 p-4 hover:bg-ink-50/50 transition-colors cursor-pointer" onclick="openScheduleEditModal(${item.id})">
            <div class="flex flex-col items-center">
              <div class="w-2 h-2 rounded-full bg-info-500 mt-1.5"></div>
              ${!isLast ? '<div class="w-px flex-1 bg-ink-100 mt-1.5"></div>' : ''}
            </div>
            <div class="flex-1 pb-1">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="text-sm font-medium text-ink-900">${item.name}</h4>
                  <p class="text-xs text-ink-400 mt-1">日程 · ${item.location}</p>
                </div>
                <span class="text-xs text-ink-400 whitespace-nowrap">${item.start}</span>
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    initIcons();
  }

  // ========== 弹窗系统 ==========
  const modalOverlay = document.getElementById('modalOverlay');

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    closeAllModals();
    modalOverlay.classList.remove('hidden');
    modal.classList.remove('hidden');

    document.body.style.overflow = 'hidden';
    initIcons();

    if (modalId === 'ganttModal') {
      renderGanttChart();
    }
    if (modalId === 'todoListModal') {
      renderTodoList();
    }
    if (modalId === 'warningModal') {
      renderWarningQuadrants();
    }
    if (modalId === 'notificationModal') {
      renderNotificationList();
    }
    if (modalId === 'syncModal') {
      updateSyncStatus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('hidden');
    modalOverlay.classList.add('hidden');

    document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.add('hidden');
    });
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function initModalSystem() {
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', function () {
        const modalId = this.getAttribute('data-modal-close');
        closeModal(modalId);
      });
    });

    modalOverlay.addEventListener('click', closeAllModals);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  // ========== 资讯搜索与筛选 ==========
  function filterNews() {
    const searchText = document.getElementById('newsSearch').value.toLowerCase();
    let filtered = newsData.filter(news =>
      news.title.toLowerCase().includes(searchText) ||
      news.content.toLowerCase().includes(searchText) ||
      news.category.toLowerCase().includes(searchText)
    );

    if (currentCategory !== '全部') {
      filtered = filtered.filter(n => n.category === currentCategory);
    }
    
    document.getElementById('searchCount').textContent = filtered.length + '条';
    renderNewsList(filtered);
  }

  function filterNewsByCategory(category) {
    currentCategory = category;

    document.querySelectorAll('.tab-chip').forEach(chip => {
      chip.classList.remove('active', 'bg-brand-500', 'text-white');
      chip.classList.add('bg-white', 'text-ink-600');
    });

    const activeChip = document.querySelector(`.tab-chip[onclick="filterNewsByCategory('${category}')"]`);
    if (activeChip) {
      activeChip.classList.add('active', 'bg-brand-500', 'text-white');
      activeChip.classList.remove('bg-white', 'text-ink-600');
    }

    document.getElementById('newsSearch').value = '';
    filterNews();
  }

  function renderNewsList(list) {
    const container = document.getElementById('newsList');

    if (list.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center py-12"><i data-lucide="search-x" class="w-12 h-12 mx-auto text-ink-300 mb-3"></i><p class="text-sm text-ink-400">未找到相关资讯</p></div>';
      initIcons();
      return;
    }

    container.innerHTML = list.map((news, index) => {
      const colors = [
        'from-brand-200 to-brand-400',
        'from-success-200 to-success-400',
        'from-info-200 to-info-400',
        'from-warning-200 to-warning-400',
        'from-brand-200 to-brand-400',
        'from-success-200 to-success-400'
      ];
      const icons = ['trending-up', 'film', 'lightbulb', 'bar-chart-3', 'flame', 'play-circle'];

      return '<article class="info-card bg-white rounded-xl2 overflow-hidden shadow-card hover:shadow-cardHover transition-shadow cursor-pointer group" onclick="openNewsById(' + news.id + ')"><div class="aspect-[16/9] bg-gradient-to-br ' + colors[index % colors.length] + ' relative overflow-hidden"><div class="absolute inset-0 flex items-center justify-center text-white/30"><i data-lucide="' + icons[index % icons.length] + '" class="w-20 h-20"></i></div><span class="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/90 backdrop-blur text-xs font-medium text-brand-700">' + news.category + '</span></div><div class="p-4"><h3 class="text-sm font-semibold text-ink-900 line-clamp-2 group-hover:text-brand-600 transition-colors">' + news.title + '</h3><p class="text-xs text-ink-400 mt-2 line-clamp-2">' + news.content.replace(/<[^>]*>/g, '').substring(0, 80) + '...</p><div class="flex items-center justify-between mt-3 pt-3 border-t border-ink-50"><span class="text-xs text-ink-300">' + news.time + ' · ' + news.source + '</span><button class="text-ink-300 hover:text-brand-500 transition-colors bookmark-btn" onclick="event.stopPropagation()"><i data-lucide="bookmark" class="w-4 h-4"></i></button></div></div></article>';
    }).join('');

    initIcons();
    
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const icon = this.querySelector('[data-lucide]');
        if (this.classList.contains('text-brand-500')) {
          this.classList.remove('text-brand-500', 'hover:text-brand-600');
          this.classList.add('text-ink-300', 'hover:text-brand-500');
          if (icon) icon.setAttribute('data-lucide', 'bookmark');
        } else {
          this.classList.add('text-brand-500', 'hover:text-brand-600');
          this.classList.remove('text-ink-300', 'hover:text-brand-500');
          if (icon) icon.setAttribute('data-lucide', 'bookmark-check');
        }
        initIcons();
      });
    });
  }

  function openNewsById(id) {
    const news = newsData.find(n => n.id === id);
    if (!news) return;

    document.getElementById('newsModalTitle').textContent = news.title;
    document.getElementById('newsModalContent').innerHTML = news.content;
    document.getElementById('newsModalCategory').textContent = news.category;
    document.getElementById('newsModalSource').textContent = news.source;
    document.getElementById('newsModalTime').textContent = news.time;
    document.getElementById('newsModalReads').textContent = '阅读 ' + news.reads;
    
    const sourceLink = document.getElementById('newsSourceLink');
    if (news.sourceUrl) {
      sourceLink.onclick = function() {
        window.open(news.sourceUrl, '_blank');
      };
      sourceLink.style.display = 'flex';
    } else {
      sourceLink.style.display = 'none';
    }

    openModal('newsModal');
  }

  // ========== 待办任务功能 ==========
  function getQuadrantLabel(quadrant) {
    const quadrantMap = {
      'urgent-important': '紧急·重要',
      'normal-important': '不紧急·重要',
      'urgent-normal': '紧急·不重要',
      'normal-normal': '不紧急·不重要'
    };
    return quadrantMap[quadrant] || '';
  }

  function getQuadrantClass(quadrant) {
    const classMap = {
      'urgent-important': 'bg-danger-50 text-danger-600',
      'normal-important': 'bg-brand-50 text-brand-600',
      'urgent-normal': 'bg-warning-50 text-warning-600',
      'normal-normal': 'bg-info-50 text-info-600'
    };
    return classMap[quadrant] || 'bg-ink-50 text-ink-500';
  }

  function getTodoTypeLabel(type) {
    const typeMap = {
      'day': '日',
      'week': '周',
      'month': '月'
    };
    return typeMap[type] || '周';
  }

  function getTodoTypeClass(type) {
    const classMap = {
      'day': 'bg-success-50 text-success-600',
      'week': 'bg-brand-50 text-brand-600',
      'month': 'bg-info-50 text-info-600'
    };
    return classMap[type] || 'bg-ink-50 text-ink-500';
  }

  function renderTodoList() {
    const container = document.getElementById('todoListContainer');
    
    if (todos.length === 0) {
      container.innerHTML = '<div class="empty-state"><i data-lucide="list-todo"></i><div class="empty-state-text">暂无待办任务</div></div>';
      initIcons();
      return;
    }

    container.innerHTML = todos.map(todo => {
      const childSchedules = schedules.filter(s => s.parentTodoId === todo.id);
      let childHtml = '';
      if (childSchedules.length > 0) {
        const completedCount = childSchedules.filter(s => s.progress >= 100).length;
        childHtml = '<div class="todo-child-tasks"><span class="text-xs text-ink-400">' + childSchedules.length + '项子任务</span><span class="text-xs text-success-500">' + completedCount + '/' + childSchedules.length + '已完成</span></div>';
      }
      
      return '<div class="todo-item ' + (todo.completed ? 'completed' : '') + '"><div class="todo-checkbox ' + (todo.completed ? 'checked' : '') + '" onclick="toggleTodo(' + todo.id + ')">' + (todo.completed ? '<i data-lucide="check" class="w-4 h-4 text-white"></i>' : '') + '</div><div class="todo-content"><div class="todo-title-row"><span class="todo-type-tag ' + getTodoTypeClass(todo.type) + '">' + getTodoTypeLabel(todo.type) + '</span><span class="todo-title">' + todo.name + '</span></div>' + childHtml + '<div class="todo-meta-row">' + (todo.quadrant ? '<span class="todo-quadrant ' + getQuadrantClass(todo.quadrant) + '">' + getQuadrantLabel(todo.quadrant) + '</span>' : '') + '<span class="todo-priority ' + todo.priority + '">' + (todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低') + '</span><span class="todo-progress-text">进度 ' + (todo.progress || 0) + '%</span></div><div class="todo-meta-row">' + (todo.partners ? '<span class="todo-meta-item"><i data-lucide="users" class="w-3 h-3"></i>' + todo.partners + '</span>' : '') + (todo.deadline ? '<span class="todo-meta-item"><i data-lucide="clock" class="w-3 h-3"></i>' + todo.deadline.split('T')[0] + ' ' + (todo.deadline.split('T')[1] ? todo.deadline.split('T')[1].substring(0, 5) : '--:--') + '</span>' : '') + '</div></div><div class="todo-actions"><button class="todo-action-btn" onclick="editTodo(' + todo.id + ')"><i data-lucide="edit-2" class="w-4 h-4"></i></button><button class="todo-action-btn delete" onclick="deleteTodo(' + todo.id + ')"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>';
    }).join('');

    initIcons();
  }

  let currentEditTodoId = null;
  let currentEditScheduleId = null;

  function openTodoEditModal(id = null) {
    const form = document.getElementById('todoEditForm');
    currentEditTodoId = id;
    document.getElementById('todoEditTitle').textContent = id ? '编辑待办' : '添加待办';
    document.getElementById('todoDeleteBtn').classList.toggle('hidden', !id);

    if (id) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        document.getElementById('todoEditId').value = todo.id;
        document.getElementById('todoEditName').value = todo.name;
        document.getElementById('todoEditDeadline').value = todo.deadline || '';
        document.getElementById('todoEditType').value = todo.type || 'week';
        document.getElementById('todoEditQuadrant').value = todo.quadrant || 'normal-normal';
        document.getElementById('todoEditPriority').value = todo.priority;
        document.getElementById('todoEditPartners').value = todo.partners || '';
        document.getElementById('todoEditProgress').value = todo.progress || 0;
        document.getElementById('todoEditProgressText').textContent = (todo.progress || 0) + '%';
        document.getElementById('todoEditDescription').value = todo.description || '';
      }
    } else {
      form.reset();
      document.getElementById('todoEditId').value = '';
      document.getElementById('todoEditType').value = 'week';
      document.getElementById('todoEditQuadrant').value = 'normal-normal';
      document.getElementById('todoEditProgress').value = 0;
      document.getElementById('todoEditProgressText').textContent = '0%';
    }

    openModal('todoEditModal');
    initProgressSlider();
  }

  function deleteTodoFromEdit() {
    if (currentEditTodoId) {
      deleteTodo(currentEditTodoId);
      currentEditTodoId = null;
    }
  }

  async function saveTodo(e) {
    e.preventDefault();
    
    const id = document.getElementById('todoEditId').value;
    const todo = {
      id: id ? parseInt(id) : Date.now(),
      name: document.getElementById('todoEditName').value,
      type: document.getElementById('todoEditType').value,
      deadline: document.getElementById('todoEditDeadline').value,
      quadrant: document.getElementById('todoEditQuadrant').value,
      priority: document.getElementById('todoEditPriority').value,
      partners: document.getElementById('todoEditPartners').value,
      progress: parseInt(document.getElementById('todoEditProgress').value),
      description: document.getElementById('todoEditDescription').value,
      completed: false
    };

    if (id) {
      const index = todos.findIndex(t => t.id === parseInt(id));
      if (index !== -1) {
        todo.completed = todos[index].completed;
        todos[index] = todo;
        
        // 使用 dataService 更新
        if (window.dataService) {
          await window.dataService.saveTodo(todo);
        }
        
        syncTodoToSchedules(todo);
      }
    } else {
      todos.push(todo);
      
      // 使用 dataService 保存
      if (window.dataService) {
        await window.dataService.saveTodo(todo);
      }
    }

    await saveTodos();
    updateWarningBadge();
    closeModal('todoEditModal');
    openModal('todoListModal');
  }

  function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.progress = todo.completed ? 100 : 0;
      saveTodos();
      updateWarningBadge();
      if (!document.getElementById('warningModal').classList.contains('hidden')) {
        renderWarningQuadrants();
      }
    }
  }

  function editTodo(id) {
    openTodoEditModal(id);
  }

  async function deleteTodo(id) {
    if (confirm('确定要删除这个待办吗？关联的日程不会被删除。')) {
      todos = todos.filter(t => t.id !== id);
      
      // 使用 dataService 删除
      if (window.dataService) {
        await window.dataService.deleteTodo(id);
      }
      
      schedules.forEach(s => {
        if (s.parentTodoId === id) {
          s.parentTodoId = null;
        }
      });
      await saveTodos();
      await saveSchedules();
      closeModal('todoEditModal');
      openModal('todoListModal');
    }
  }

  // ========== 日程甘特图 ==========
  function getStatusBadge(status) {
    const statusMap = {
      'pending': { text: '未开始', color: 'bg-ink-100 text-ink-500' },
      'in-progress': { text: '进行中', color: 'bg-info-100 text-info-600' },
      'completed': { text: '已完成', color: 'bg-success-100 text-success-600' },
      'cancelled': { text: '已取消', color: 'bg-danger-100 text-danger-600' }
    };
    return statusMap[status] || statusMap['pending'];
  }

  function getScheduleGradient(schedule) {
    const progress = schedule.progress || 0;
    const status = schedule.status || 'pending';
    const quadrant = schedule.quadrant || '';
    
    if (status === 'completed' || progress >= 100) {
      return 'linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)';
    }
    if (status === 'cancelled') {
      return 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)';
    }
    
    if (quadrant === 'urgent-important') {
      if (progress < 30) return 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)';
      if (progress < 70) return 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)';
      return 'linear-gradient(135deg, #FECACA 0%, #F87171 100%)';
    }
    if (quadrant === 'normal-important') {
      if (progress < 30) return 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)';
      if (progress < 70) return 'linear-gradient(135deg, #FDBA74 0%, #F97316 100%)';
      return 'linear-gradient(135deg, #FED7AA 0%, #FB923C 100%)';
    }
    if (quadrant === 'urgent-normal') {
      if (progress < 30) return 'linear-gradient(135deg, #FACC15 0%, #CA8A04 100%)';
      if (progress < 70) return 'linear-gradient(135deg, #FDE047 0%, #EAB308 100%)';
      return 'linear-gradient(135deg, #FEF08A 0%, #FACC15 100%)';
    }
    if (quadrant === 'normal-normal') {
      if (progress < 30) return 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)';
      if (progress < 70) return 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)';
      return 'linear-gradient(135deg, #BFDBFE 0%, #60A5FA 100%)';
    }
    
    const gradientMap = {
      'pending': 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
      'in-progress': 'linear-gradient(135deg, #FDBA74 0%, #F97316 100%)',
      'completed': 'linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)',
      'cancelled': 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)'
    };
    return gradientMap[status] || gradientMap['pending'];
  }

  function renderGanttChart() {
    const container = document.getElementById('ganttContainer');
    const dateStr = currentGanttDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const isToday = dateStr === today;
    const daySchedules = schedules.filter(s => s.date === dateStr);
    
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[currentGanttDate.getDay()];
    const titleEl = document.getElementById('ganttDateTitle');
    titleEl.innerHTML = `${currentGanttDate.getFullYear()}年${currentGanttDate.getMonth() + 1}月${currentGanttDate.getDate()}日 ${weekday}${isToday ? '<span class="ml-2 px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-medium">【今天】</span>' : ''}`;

    let html = '';
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0') + ':00';
      const hourSchedules = daySchedules.filter(s => {
        const startHour = parseInt(s.start.split(':')[0]);
        const endHour = parseInt(s.end.split(':')[0]);
        return hour >= startHour && hour < endHour;
      });

      html += `<div class="gantt-hour-row">`;
      html += `<div class="gantt-hour-label">${hourStr}</div>`;
      html += `<div class="gantt-hour-content">`;
      
      if (hourSchedules.length > 0) {
        html += `<div class="gantt-schedule-stack">`;
        hourSchedules.forEach(s => {
          const statusInfo = getStatusBadge(s.status);
          const gradient = getScheduleGradient(s);
          const progress = s.progress || 0;
          const parentTodo = s.parentTodoId ? todos.find(t => t.id === s.parentTodoId) : null;
          html += `
            <div class="gantt-schedule-block" style="background: ${gradient};" onclick="openScheduleEditModal(${s.id})">
              <div class="gantt-schedule-top">
                <div class="gantt-schedule-title">${s.name}</div>
                <span class="gantt-status-badge ${statusInfo.color}">${statusInfo.text}</span>
              </div>
              ${parentTodo ? `<div class="gantt-parent-todo"><i data-lucide="link" class="w-3 h-3"></i>${parentTodo.name}</div>` : ''}
              <div class="gantt-schedule-meta">
                <span class="gantt-schedule-time">${s.start} - ${s.end}</span>
              </div>
              <div class="gantt-progress-section">
                <div class="gantt-progress-text">进度 ${progress}%</div>
                <div class="gantt-progress-bar">
                  <div class="gantt-progress-fill" style="width: ${progress}%"></div>
                </div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      } else {
        html += '<div class="gantt-empty-slot" onclick="openScheduleEditModal(null, \'' + hourStr.substring(0, 2) + ':00\')"></div>';
      }
      
      html += `</div></div>`;
    }

    container.innerHTML = html;
  }

  function changeGanttDate(delta) {
    currentGanttDate.setDate(currentGanttDate.getDate() + delta);
    renderGanttChart();
  }

  function populateTodoSelect(selectedId = null) {
    const select = document.getElementById('scheduleEditParentTodo');
    if (!select) return;
    
    let html = '<option value="">新建为独立待办</option>';
    todos.filter(t => !t.completed).forEach(todo => {
      const selected = selectedId && parseInt(selectedId) === todo.id ? 'selected' : '';
      html += `<option value="${todo.id}" ${selected}>${getTodoTypeLabel(todo.type)} | ${todo.name}</option>`;
    });
    select.innerHTML = html;
  }

  function openScheduleEditModal(id = null, defaultStart = null) {
    const form = document.getElementById('scheduleEditForm');
    currentEditScheduleId = id;
    document.getElementById('scheduleEditTitle').textContent = id ? '编辑日程' : '添加日程';
    document.getElementById('scheduleDeleteBtn').classList.toggle('hidden', !id);

    populateTodoSelect(id ? schedules.find(s => s.id === id)?.parentTodoId : null);

    if (id) {
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        document.getElementById('scheduleEditId').value = schedule.id;
        document.getElementById('scheduleEditDate').value = schedule.date;
        document.getElementById('scheduleEditName').value = schedule.name;
        document.getElementById('scheduleEditStart').value = schedule.start;
        document.getElementById('scheduleEditEnd').value = schedule.end;
        document.getElementById('scheduleEditQuadrant').value = schedule.quadrant || 'normal-normal';
        document.getElementById('scheduleEditProgress').value = schedule.progress || 0;
        document.getElementById('scheduleEditProgressText').textContent = (schedule.progress || 0) + '%';
        document.getElementById('scheduleEditLocation').value = schedule.location || '';
        document.getElementById('scheduleEditParticipants').value = schedule.participants || '';
        document.getElementById('scheduleEditNote').value = schedule.note || '';
      }
    } else {
      form.reset();
      document.getElementById('scheduleEditId').value = '';
      document.getElementById('scheduleEditDate').value = currentGanttDate.toISOString().split('T')[0];
      document.getElementById('scheduleEditStart').value = defaultStart || '10:00';
      document.getElementById('scheduleEditEnd').value = defaultStart ? (parseInt(defaultStart.split(':')[0]) + 1).toString().padStart(2, '0') + ':00' : '11:00';
      document.getElementById('scheduleEditQuadrant').value = 'normal-normal';
      document.getElementById('scheduleEditProgress').value = 0;
      document.getElementById('scheduleEditProgressText').textContent = '0%';
    }

    openModal('scheduleEditModal');
    initProgressSlider();
    initTimeSync('scheduleEditStart', 'scheduleEditEnd');
  }

  function deleteScheduleFromEdit() {
    if (currentEditScheduleId) {
      deleteSchedule(currentEditScheduleId);
      currentEditScheduleId = null;
    }
  }

  function initTimeSync(startId, endId) {
    const startEl = document.getElementById(startId);
    const endEl = document.getElementById(endId);
    if (!startEl || !endEl) return;

    startEl.addEventListener('change', function() {
      const [h, m] = this.value.split(':').map(Number);
      let nextH = h + 1;
      if (nextH >= 24) nextH = 23;
      endEl.value = String(nextH).padStart(2, '0') + ':' + String(m).padStart(2, '0');
      validateTimeRange(startEl, endEl);
    });

    endEl.addEventListener('change', function() {
      validateTimeRange(startEl, endEl);
    });
  }

  function validateTimeRange(startEl, endEl) {
    if (startEl.value >= endEl.value) {
      const [h, m] = startEl.value.split(':').map(Number);
      let nextH = h + 1;
      if (nextH >= 24) nextH = 23;
      endEl.value = String(nextH).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }
  }

  function getAutoStatus(progress) {
    if (progress <= 0) return 'pending';
    if (progress >= 100) return 'completed';
    return 'in-progress';
  }

  async function saveSchedule(e) {
    e.preventDefault();
    
    const id = document.getElementById('scheduleEditId').value;
    const parentTodoId = document.getElementById('scheduleEditParentTodo').value;
    const name = document.getElementById('scheduleEditName').value;
    const quadrant = document.getElementById('scheduleEditQuadrant').value;
    const progress = parseInt(document.getElementById('scheduleEditProgress').value);
    const status = getAutoStatus(progress);

    const schedule = {
      id: id ? parseInt(id) : Date.now(),
      date: document.getElementById('scheduleEditDate').value,
      start: document.getElementById('scheduleEditStart').value,
      end: document.getElementById('scheduleEditEnd').value,
      name: name,
      parentTodoId: parentTodoId ? parseInt(parentTodoId) : null,
      quadrant: quadrant,
      status: status,
      progress: progress,
      location: document.getElementById('scheduleEditLocation').value,
      participants: document.getElementById('scheduleEditParticipants').value,
      note: document.getElementById('scheduleEditNote').value
    };

    if (id) {
      const index = schedules.findIndex(s => s.id === parseInt(id));
      if (index !== -1) {
        const oldSchedule = schedules[index];
        schedule.parentTodoId = oldSchedule.parentTodoId;
        schedules[index] = schedule;
        
        if (window.dataService) {
          await window.dataService.saveSchedule(schedule);
        }
        
        if (schedule.parentTodoId) {
          updateTodoProgressFromSchedules(schedule.parentTodoId);
          const todo = todos.find(t => t.id === schedule.parentTodoId);
          if (todo) {
            if (schedule.quadrant) {
              todo.quadrant = schedule.quadrant;
            }
            if (schedule.participants) {
              todo.partners = schedule.participants;
            }
            if (schedule.note) {
              todo.description = schedule.note;
            }
          }
        }
      }
    } else {
      if (parentTodoId) {
        schedule.parentTodoId = parseInt(parentTodoId);
      } else {
        const newTodo = {
          id: Date.now() + 1,
          name: name,
          type: 'day',
          deadline: schedule.date + 'T' + schedule.end,
          quadrant: quadrant,
          priority: 'medium',
          partners: schedule.participants || '',
          progress: progress,
          description: schedule.note || '',
          completed: false
        };
        todos.push(newTodo);
        
        // 使用 dataService 保存新待办
        if (window.dataService) {
          await window.dataService.saveTodo(newTodo);
        }
        
        schedule.parentTodoId = newTodo.id;
      }
      schedules.push(schedule);
      
      // 使用 dataService 保存日程
      if (window.dataService) {
        await window.dataService.saveSchedule(schedule);
      }
    }

    updateTodoProgressFromSchedules(schedule.parentTodoId);
    await saveSchedules();
    await saveTodos();
    updateStats();
    updateWarningBadge();
    renderTodoList();
    renderGanttChart();
    renderTimeline();
    
    renderWarningQuadrants();
    
    closeModal('scheduleEditModal');
    openModal('ganttModal');
  }

  async function deleteSchedule(id) {
    if (confirm('确定要删除这个日程吗？')) {
      const schedule = schedules.find(s => s.id === id);
      schedules = schedules.filter(s => s.id !== id);
      
      if (window.dataService) {
        await window.dataService.deleteSchedule(id);
      }
      
      if (schedule && schedule.parentTodoId) {
        const hasOtherSchedules = schedules.some(s => s.parentTodoId === schedule.parentTodoId);
        if (!hasOtherSchedules) {
          todos = todos.filter(t => t.id !== schedule.parentTodoId);
          if (window.dataService) {
            await window.dataService.deleteTodo(schedule.parentTodoId);
          }
        } else {
          updateTodoProgressFromSchedules(schedule.parentTodoId);
          const relatedTodo = todos.find(t => t.id === schedule.parentTodoId);
          if (relatedTodo) {
            const firstSchedule = schedules.find(s => s.parentTodoId === schedule.parentTodoId);
            if (firstSchedule && firstSchedule.quadrant) {
              relatedTodo.quadrant = firstSchedule.quadrant;
            }
          }
        }
      }
      
      await saveSchedules();
      await saveTodos();
      updateStats();
      updateWarningBadge();
      renderTodoList();
      renderGanttChart();
      renderTimeline();
      renderWarningQuadrants();
      
      closeModal('scheduleEditModal');
      openModal('ganttModal');
    }
  }

  function updateTodoProgressFromSchedules(todoId) {
    if (!todoId) return;
    const relatedSchedules = schedules.filter(s => s.parentTodoId === todoId);
    if (relatedSchedules.length === 0) return;
    
    const avgProgress = Math.round(relatedSchedules.reduce((sum, s) => sum + (s.progress || 0), 0) / relatedSchedules.length);
    const todo = todos.find(t => t.id === todoId);
    
    if (todo) {
      todo.progress = avgProgress;
    }
  }

  function syncTodoToSchedules(todo) {
    schedules.forEach(schedule => {
      if (schedule.parentTodoId === todo.id) {
        schedule.quadrant = todo.quadrant;
        schedule.participants = todo.partners;
      }
    });
    saveSchedules();
  }

  // ========== 进度条动画 ==========
  function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar-fill');
    progressBars.forEach(bar => {
      const targetWidth = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = targetWidth;
        });
      });
    });
  }

  // ========== 数字计数动画 ==========
  function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-card .text-2xl');
    statNumbers.forEach(el => {
      const text = el.textContent;
      const numMatch = text.match(/[\d.]+/);
      if (!numMatch) return;

      const target = parseFloat(numMatch[0]);
      const suffix = text.replace(numMatch[0], '');
      const duration = 800;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        if (Number.isInteger(target)) {
          el.textContent = Math.round(current) + suffix;
        } else {
          el.textContent = current.toFixed(1) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = text;
        }
      }

      requestAnimationFrame(update);
    });
  }

  // ========== 滚动渐入效果 ==========
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.stat-card, .feature-card, .info-card, .timeline-item').forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;
      observer.observe(el);
    });
  }

  // ========== 资讯刷新功能 ==========
  function refreshNews() {
    const btn = document.getElementById('refreshBtn');
    const status = document.getElementById('updateStatus');
    
    btn.classList.add('spinning');
    status.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>更新中...';
    
    setTimeout(function() {
      btn.classList.remove('spinning');
      status.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>实时更新';
      showToast('资讯已更新', 'success');
    }, 1200);
  }

  // ========== 通知系统 ==========
  function showNotification(message, type, id) {
    notificationList.unshift({
      id: Date.now(),
      message: message,
      type: type,
      itemId: id,
      time: new Date()
    });
    
    pushNotificationToast(message, type, id);
    updateBellBadge();
  }

  function pushNotificationToast(message, type, id) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast notification-' + type;
    toast.innerHTML = `
      <div class="notification-icon">
        <i data-lucide="bell" class="w-5 h-5"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">新通知</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;
    
    document.body.appendChild(toast);
    initIcons();
    
    setTimeout(function() {
      toast.classList.add('notification-out');
      setTimeout(function() {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }

  function updateBellBadge() {
    const unreadCount = notificationList.length;
    const badges = document.querySelectorAll('#bellBadge');
    badges.forEach(badge => {
      if (unreadCount > 0) {
        badge.style.display = 'flex';
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      } else {
        badge.style.display = 'none';
      }
    });
  }

  function renderNotificationList() {
    const container = document.getElementById('notificationList');
    const countEl = document.getElementById('notifCount');
    
    if (countEl) {
      countEl.textContent = notificationList.length;
    }
    
    if (notificationList.length === 0) {
      container.innerHTML = '<div class="empty-state"><i data-lucide="bell-off"></i><div class="empty-state-text">暂无通知</div></div>';
      initIcons();
      return;
    }
    
    container.innerHTML = notificationList.map(item => {
      const timeStr = formatTime(item.time);
      const icon = item.type === 'todo' ? 'alert-triangle' : 'calendar';
      
      return `
        <div class="notification-item unread" onclick="handleNotificationClick('${item.type}', ${item.itemId})">
          <div class="notification-item-icon ${item.type}">
            <i data-lucide="${icon}" class="w-5 h-5"></i>
          </div>
          <div class="notification-item-content">
            <div class="notification-item-title">${item.message}</div>
            <div class="notification-item-time">${timeStr}</div>
          </div>
        </div>
      `;
    }).join('');
    
    initIcons();
  }

  function formatTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return minutes + '分钟前';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + '小时前';
    return Math.floor(hours / 24) + '天前';
  }

  function handleNotificationClick(type, id) {
    closeModal('notificationModal');
    if (type === 'todo') {
      openTodoEditModal(id);
    } else {
      openScheduleEditModal(id);
    }
  }

  function clearNotifications() {
    notificationList = [];
    updateBellBadge();
    renderNotificationList();
    showToast('已全部标记为已读', 'success');
  }

  // ========== 进度滑块事件 ==========
  function initProgressSlider() {
    const slider = document.getElementById('todoEditProgress');
    const text = document.getElementById('todoEditProgressText');
    if (slider && text) {
      slider.removeEventListener('input', updateSliderText);
      slider.addEventListener('input', function() {
        text.textContent = this.value + '%';
      });
    }
    
    const scheduleSlider = document.getElementById('scheduleEditProgress');
    const scheduleText = document.getElementById('scheduleEditProgressText');
    if (scheduleSlider && scheduleText) {
      scheduleSlider.removeEventListener('input', updateScheduleSliderText);
      scheduleSlider.addEventListener('input', function() {
        scheduleText.textContent = this.value + '%';
      });
    }
  }
  
  function updateSliderText(e) {
    const text = document.getElementById('todoEditProgressText');
    if (text) text.textContent = e.target.value + '%';
  }
  
  function updateScheduleSliderText(e) {
    const text = document.getElementById('scheduleEditProgressText');
    if (text) text.textContent = e.target.value + '%';
  }

  // ========== 分享链接功能 ==========

  async function generateShareLink() {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedules = schedules.filter(s => s.date === today);

    if (todaySchedules.length === 0) {
      showToast('今天没有日程安排', 'info');
      return;
    }

    const shareData = {
      date: today,
      schedules: todaySchedules.map(s => ({
        name: s.name, start: s.start, end: s.end,
        quadrant: s.quadrant, status: s.status,
        location: s.location || '', participants: s.participants || ''
      })),
      generatedAt: new Date().toISOString()
    };

    const baseUrl = (window.SHARE_BASE_URL && window.SHARE_BASE_URL !== 'https://YOUR-VERCEL-DOMAIN.vercel.app')
      ? window.SHARE_BASE_URL
      : window.location.origin + window.location.pathname;

    // 1. 立即生成长链接（同步）
    const longUrl = baseUrl + '?share=' + compressShareData(shareData);

    // 2. 立即复制到剪贴板（在用户点击事件上下文中，execCommand同步执行）
    syncCopyToClipboard(longUrl);

    // 3. 显示分享弹窗
    showShareModal(longUrl, '链接已复制到剪贴板');

    // 4. 后台尝试生成短链接
    try {
      const shortUrl = await tryShortenUrl(longUrl, shareData, baseUrl);
      if (shortUrl && shortUrl !== longUrl) {
        syncCopyToClipboard(shortUrl);
        showShareModal(shortUrl, '短链接已复制到剪贴板');
        showToast('短链接已生成并复制', 'success');
      }
    } catch (e) {
      console.warn('[分享] 短链接生成失败，使用长链接:', e.message);
    }
  }

  // 同步复制 - 在用户手势上下文中立即执行
  function syncCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (e) {
      console.warn('[复制] execCommand失败:', e.message);
    }
    document.body.removeChild(textarea);

    if (!success && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }

    return success;
  }

  // 显示分享弹窗
  function showShareModal(url, message) {
    const existing = document.getElementById('shareLinkModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'shareLinkModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    modal.innerHTML = '<div style="background:#fff;border-radius:16px;padding:24px;max-width:420px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.15);">' +
      '<div style="text-align:center;margin-bottom:16px;">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:#EFFBF4;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5BB88C" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>' +
      '</div>' +
      '<div style="font-size:16px;font-weight:600;color:#2D2319;">' + message + '</div>' +
      '</div>' +
      '<div style="background:#FAF8F6;border-radius:12px;padding:12px;margin-bottom:16px;">' +
      '<input type="text" id="shareLinkInput" value="' + url.replace(/"/g, '&quot;') + '" readonly ' +
      'style="width:100%;border:none;background:transparent;font-size:13px;color:#6B5B4D;outline:none;font-family:monospace;" ' +
      'onclick="this.select()" />' +
      '</div>' +
      '<div style="display:flex;gap:8px;">' +
      '<button id="shareCopyBtn" style="flex:1;padding:10px;border-radius:10px;border:none;background:#E8915A;color:#fff;font-size:14px;font-weight:500;cursor:pointer;">复制链接</button>' +
      '<button id="shareCloseBtn" style="flex:1;padding:10px;border-radius:10px;border:none;background:#F0EBE6;color:#6B5B4D;font-size:14px;font-weight:500;cursor:pointer;">关闭</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(modal);

    const input = document.getElementById('shareLinkInput');
    if (input) setTimeout(() => input.select(), 100);

    document.getElementById('shareCopyBtn').onclick = function() {
      syncCopyToClipboard(url);
      showToast('已复制到剪贴板', 'success');
    };

    document.getElementById('shareCloseBtn').onclick = function() {
      modal.remove();
    };

    modal.onclick = function(e) {
      if (e.target === modal) modal.remove();
    };
  }

  // 尝试生成短链接
  async function tryShortenUrl(longUrl, shareData, baseUrl) {
    // 1. 上传数据到jsonblob，获取短ID
    let cloudId = null;
    try {
      cloudId = await uploadToJsonblob(shareData);
      console.log('[分享] jsonblob ID:', cloudId);
    } catch (e) {
      console.warn('[分享] jsonblob失败:', e.message);
    }

    let targetUrl = longUrl;
    if (cloudId) {
      targetUrl = baseUrl + '?s=' + cloudId;
    }

    // 2. 用短链服务缩短
    const services = [
      'https://is.gd/create.php?format=simple&url=',
      'https://v.gd/create.php?format=simple&url=',
      'https://tinyurl.com/api-create.php?url='
    ];

    for (const svc of services) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(svc + encodeURIComponent(targetUrl), { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) continue;
        const text = await res.text();
        if (text && text.trim().startsWith('http')) {
          console.log('[短链] 成功:', text.trim());
          return text.trim();
        }
      } catch (e) {
        console.warn('[短链] 失败:', e.message);
      }
    }

    // 3. 短链服务都失败，返回jsonblob ID链接（如果有的话）
    if (cloudId) return targetUrl;

    throw new Error('短链服务不可用');
  }

  // 上传数据到jsonblob
  async function uploadToJsonblob(data) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://jsonblob.com/api/jsonBlob', {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('jsonblob ' + res.status);
    const loc = res.headers.get('Location') || res.headers.get('location');
    if (loc) return loc.split('/').pop();
    throw new Error('无法获取ID');
  }

  // 从jsonblob加载数据
  async function loadFromJsonblob(id) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch('https://jsonblob.com/api/jsonBlob/' + id, {
      method: 'GET', mode: 'cors',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('jsonblob ' + res.status);
    return await res.json();
  }

  // 压缩分享数据
  function compressShareData(shareData) {
    const mini = shareData.schedules.map(s => {
      return s.name + '|' + s.start + '|' + s.end + '|' + (s.quadrant || '') + '|' + (s.status || '');
    }).join('~');
    const payload = shareData.date + '`' + mini + '`' + shareData.generatedAt;
    return btoa(unescape(encodeURIComponent(payload)));
  }

  // 解压缩分享数据
  function decompressShareData(encoded) {
    try {
      const payload = decodeURIComponent(escape(atob(encoded)));
      const parts = payload.split('`');
      const date = parts[0];
      const scheduleStr = parts[1] || '';
      const generatedAt = parts[2] || '';
      const schedules = scheduleStr.split('~').filter(s => s).map(s => {
        const fields = s.split('|');
        return { name: fields[0] || '', start: fields[1] || '', end: fields[2] || '', quadrant: fields[3] || 'normal-normal', status: fields[4] || 'pending', location: '', participants: '' };
      });
      return { date, schedules, generatedAt };
    } catch (e) {
      return null;
    }
  }

  async function copyToClipboard(text, successMessage) {
    if (!text) {
      showToast('没有可复制的内容', 'error');
      return false;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage, 'success');
        return true;
      } catch (err) {
        console.warn('[复制] Clipboard API 失败:', err.message);
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(textarea);

    try {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      if (successful) {
        showToast(successMessage, 'success');
        return true;
      }
    } catch (err) {
      console.warn('[复制] execCommand(textarea) 失败:', err.message);
    }

    document.body.removeChild(textarea);

    const input = document.createElement('input');
    input.value = text;
    input.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(input);

    try {
      input.focus();
      input.select();
      input.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      if (successful) {
        showToast(successMessage, 'success');
        return true;
      }
    } catch (err) {
      console.warn('[复制] execCommand(input) 失败:', err.message);
    }

    document.body.removeChild(input);

    const pre = document.createElement('pre');
    pre.textContent = text;
    pre.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(pre);

    try {
      const range = document.createRange();
      range.selectNodeContents(pre);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      const successful = document.execCommand('copy');
      if (successful) {
        showToast(successMessage, 'success');
        return true;
      }
    } catch (err) {
      console.warn('[复制] execCommand(pre) 失败:', err.message);
    }

    document.body.removeChild(pre);

    showToast('链接已生成，请手动复制', 'info');
    setTimeout(() => {
      const tempInput = document.createElement('input');
      tempInput.value = text;
      tempInput.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
      document.body.appendChild(tempInput);
      tempInput.focus();
      tempInput.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          showToast('链接已复制到剪贴板', 'success');
        }
      } catch (e) {
        console.warn('[复制] 最后的尝试也失败了');
      }
      
      document.body.removeChild(tempInput);
    }, 300);

    return false;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-' + type;
    
    const icons = {
      'success': 'check-circle',
      'error': 'alert-circle',
      'warning': 'alert-triangle',
      'info': 'info'
    };
    
    const icon = icons[type] || icons['info'];
    toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 toast-icon"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    initIcons();
    
    setTimeout(function() {
      toast.classList.add('fade-out');
      setTimeout(function() {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2500);
  }

  async function loadSharedData() {
    const urlParams = new URLSearchParams(window.location.search);
    const shortId = urlParams.get('s');
    const shareData = urlParams.get('share');

    // 短ID模式：从jsonblob加载数据
    if (shortId) {
      try {
        showToast('正在加载分享数据...', 'info');
        const data = await loadFromJsonblob(shortId);
        if (data) {
          showShareView(data);
          return;
        }
      } catch (e) {
        console.error('[分享] 加载失败:', e);
      }
      showToast('链接已过期或无法加载', 'error');
      return;
    }

    // 压缩链接模式
    if (shareData) {
      try {
        // 先尝试解压新格式
        const data = decompressShareData(shareData);
        if (data) {
          showShareView(data);
          return;
        }

        // 兼容旧格式（JSON base64）
        const decodedData = JSON.parse(decodeURIComponent(escape(atob(shareData))));
        if (decodedData.date && decodedData.schedules) {
          showShareView(decodedData);
        } else {
          applySharedData(decodedData);
        }
      } catch (e) {
        console.error('[分享] 解析失败:', e);
        showToast('加载分享数据失败', 'error');
      }
    }
  }

  // 从jsonblob加载数据
  async function loadFromJsonblob(id) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('https://jsonblob.com/api/jsonBlob/' + id, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('jsonblob返回 ' + res.status);

    const data = await res.json();
    if (data && data.schedules) {
      return data;
    }

    return null;
  }

  function applySharedData(decodedData) {
    if (decodedData.date && decodedData.schedules && !decodedData.todos && !decodedData.t) {
      showShareView(decodedData);
      return;
    }

    if (decodedData.todos) {
      todos = decodedData.todos;
      localStorage.setItem('workbench_todos', JSON.stringify(todos));
    }
    if (decodedData.schedules) {
      schedules = decodedData.schedules;
      localStorage.setItem('workbench_schedules', JSON.stringify(schedules));
    }
    // 兼容压缩格式
    if (decodedData.t) {
      todos = decodedData.t.map(t => ({
        id: Date.now() + Math.random(),
        name: t.n, deadline: t.d, quadrant: t.q,
        progress: t.p, completed: !!t.c, priority: 'medium',
        type: 'day', partners: '', description: ''
      }));
      localStorage.setItem('workbench_todos', JSON.stringify(todos));
    }
    if (decodedData.s) {
      schedules = decodedData.s.map(s => ({
        id: Date.now() + Math.random(),
        name: s.n, date: s.dt, start: s.st, end: s.et,
        quadrant: s.q, progress: s.p, status: s.st2,
        location: '', participants: '', note: ''
      }));
      localStorage.setItem('workbench_schedules', JSON.stringify(schedules));
    }
    updateStats();
    updateWarningBadge();
    renderTodoList();
    renderTimeline();
    renderGanttChart();
  }

  function showShareView(shareData) {
    const shareView = document.getElementById('shareView');
    const mainContent = document.getElementById('mainContent');
    const sidebar = document.getElementById('sidebar');
    const tabBar = document.querySelector('.tab-bar');

    if (shareView) {
      shareView.classList.remove('hidden');
    }
    if (mainContent) {
      mainContent.style.display = 'none';
    }
    if (sidebar) {
      sidebar.style.display = 'none';
    }
    if (tabBar) {
      tabBar.style.display = 'none';
    }

    const dateStr = shareData.date;
    const dateObj = new Date(dateStr);
    const dateEl = document.getElementById('shareDate');
    if (dateEl) {
      dateEl.textContent = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    }

    const generatedAtEl = document.getElementById('shareGeneratedAt');
    if (generatedAtEl && shareData.generatedAt) {
      const genDate = new Date(shareData.generatedAt);
      generatedAtEl.textContent = `${genDate.getFullYear()}-${String(genDate.getMonth() + 1).padStart(2, '0')}-${String(genDate.getDate()).padStart(2, '0')} ${String(genDate.getHours()).padStart(2, '0')}:${String(genDate.getMinutes()).padStart(2, '0')}`;
    }

    const scheduleList = document.getElementById('shareScheduleList');
    if (scheduleList) {
      const sortedSchedules = [...shareData.schedules].sort((a, b) => a.start.localeCompare(b.start));
      
      scheduleList.innerHTML = sortedSchedules.map(schedule => {
        const statusColor = {
          'completed': 'bg-success-100 text-success-600',
          'in-progress': 'bg-info-100 text-info-600',
          'pending': 'bg-ink-100 text-ink-500',
          'cancelled': 'bg-danger-100 text-danger-600'
        }[schedule.status] || 'bg-ink-100 text-ink-500';

        const statusText = {
          'completed': '已完成',
          'in-progress': '进行中',
          'pending': '未开始',
          'cancelled': '已取消'
        }[schedule.status] || '未知';

        const quadrantColor = {
          'urgent-important': 'border-l-4 border-danger-500',
          'normal-important': 'border-l-4 border-brand-500',
          'urgent-normal': 'border-l-4 border-warning-500',
          'normal-normal': 'border-l-4 border-info-500'
        }[schedule.quadrant] || 'border-l-4 border-ink-300';

        return `
          <div class="bg-white rounded-xl p-4 shadow-card ${quadrantColor}">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-ink-900">${schedule.name}</span>
              <span class="text-xs font-medium px-2 py-1 rounded-full ${statusColor}">${statusText}</span>
            </div>
            <div class="flex items-center gap-4 text-sm text-ink-500">
              <div class="flex items-center gap-1">
                <i data-lucide="clock" class="w-4 h-4"></i>
                <span>${schedule.start} - ${schedule.end}</span>
              </div>
              ${schedule.location ? `
              <div class="flex items-center gap-1">
                <i data-lucide="map-pin" class="w-4 h-4"></i>
                <span>${schedule.location}</span>
              </div>
              ` : ''}
            </div>
            ${schedule.participants ? `
            <div class="mt-2 flex items-center gap-1 text-sm text-ink-400">
              <i data-lucide="users" class="w-4 h-4"></i>
              <span>${schedule.participants}</span>
            </div>
            ` : ''}
          </div>
        `;
      }).join('');

      initIcons();
    }
  }

  // ========== 初始化 ==========
  document.addEventListener('DOMContentLoaded', async function () {
    closeAllModals();
    initIcons();
    await initData();  // 异步初始化数据
    loadSharedData();
    updateGreeting();
    updateDate();
    updateStats();
    updateWarningBadge();
    updateSyncStatus();
    renderTimeline();
    renderNewsList(newsData);
    initModalSystem();
    initProgressSlider();

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function() {
        const pageName = this.getAttribute('data-page');
        if (pageName) {
          switchPage(pageName);
        }
      });
    });

    setTimeout(() => {
      animateProgressBars();
      animateNumbers();
      initScrollReveal();
    }, 200);

    setInterval(updateGreeting, 60000);
    setInterval(updateDate, 60000);
    setInterval(updateWarningBadge, 300000);
  });

  // 暴露全局函数
  window.switchPage = switchPage;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.filterNews = filterNews;
  window.filterNewsByCategory = filterNewsByCategory;
  window.openNewsById = openNewsById;
  window.openTodoEditModal = openTodoEditModal;
  window.saveTodo = saveTodo;
  window.toggleTodo = toggleTodo;
  window.editTodo = editTodo;
  window.deleteTodo = deleteTodo;
  window.renderTodoList = renderTodoList;
  window.changeGanttDate = changeGanttDate;
  window.openScheduleEditModal = openScheduleEditModal;
  window.saveSchedule = saveSchedule;
  window.generateShareLink = generateShareLink;
  window.refreshNews = refreshNews;
  window.clearNotifications = clearNotifications;
  window.handleWarningItemClick = handleWarningItemClick;
  window.handleNotificationClick = handleNotificationClick;
  window.renderWarningQuadrants = renderWarningQuadrants;
  window.showToast = showToast;
  window.deleteTodoFromEdit = deleteTodoFromEdit;
  window.deleteScheduleFromEdit = deleteScheduleFromEdit;
  window.populateTodoSelect = populateTodoSelect;
  window.updateWarningBadge = updateWarningBadge;

  // ========== 数据同步功能 ==========
  async function handleSignIn() {
    const email = document.getElementById('syncEmail').value;
    const password = document.getElementById('syncPassword').value;
    
    if (!email || !password) {
      showToast('请输入邮箱和密码', 'error');
      return;
    }

    const result = await window.supabaseClient.signIn(email, password);
    
    if (result.success) {
      showToast('登录成功，数据将自动同步', 'success');
      updateSyncStatus();
      
      setTimeout(async () => {
        await window.dataService.syncFromCloud();
        todos = await window.dataService.getTodos();
        schedules = await window.dataService.getSchedules();
        
        updateStats();
        updateWarningBadge();
        renderTodoList();
        renderGanttChart();
        renderTimeline();
        
        showToast('数据已从云端同步', 'success');
      }, 1000);
    } else {
      showToast('登录失败：' + result.error, 'error');
    }
  }

  async function handleSignUp() {
    const email = document.getElementById('syncEmail').value;
    const password = document.getElementById('syncPassword').value;
    
    if (!email || !password) {
      showToast('请输入邮箱和密码', 'error');
      return;
    }

    const result = await window.supabaseClient.signUp(email, password);
    
    if (result.success) {
      showToast('注册成功，请登录', 'success');
    } else {
      showToast('注册失败：' + result.error, 'error');
    }
  }

  async function handleSignOut() {
    await window.supabaseClient.signOut();
    updateSyncStatus();
    showToast('已退出登录，数据保留在本地', 'info');
  }

  async function handleSyncFromCloud() {
    showToast('正在从云端同步数据...', 'info');
    
    try {
      await window.dataService.syncFromCloud();
      todos = await window.dataService.getTodos();
      schedules = await window.dataService.getSchedules();
      
      updateStats();
      updateWarningBadge();
      renderTodoList();
      renderGanttChart();
      renderTimeline();
      
      showToast('数据同步成功', 'success');
    } catch (error) {
      showToast('同步失败：' + error.message, 'error');
    }
  }

  async function handleSyncToCloud() {
    showToast('正在上传数据到云端...', 'info');
    
    try {
      await window.dataService.syncToCloud();
      showToast('数据上传成功', 'success');
    } catch (error) {
      showToast('上传失败：' + error.message, 'error');
    }
  }

  function updateSyncStatus() {
    const isUsingCloud = window.dataService && window.dataService.isUsingCloud();
    const user = window.supabaseClient?.getCurrentUser();
    
    const statusEl = document.getElementById('syncStatus');
    const modeTag = document.getElementById('storageModeTag');
    const loginSection = document.getElementById('syncLoginSection');
    const loggedInSection = document.getElementById('syncLoggedInSection');
    const userEmail = document.getElementById('syncUserEmail');
    
    if (isUsingCloud && user) {
      if (statusEl) {
        statusEl.textContent = '已同步';
        statusEl.classList.remove('text-ink-400');
        statusEl.classList.add('text-success-500');
      }
      if (modeTag) {
        modeTag.textContent = '云端存储';
        modeTag.className = 'text-xs font-medium px-2 py-1 rounded-full bg-success-50 text-success-600';
      }
      if (loginSection) loginSection.classList.add('hidden');
      if (loggedInSection) loggedInSection.classList.remove('hidden');
      if (userEmail) userEmail.textContent = user.email;
    } else {
      if (statusEl) {
        statusEl.textContent = '未同步';
        statusEl.classList.remove('text-success-500');
        statusEl.classList.add('text-ink-400');
      }
      if (modeTag) {
        modeTag.textContent = '本地存储';
        modeTag.className = 'text-xs font-medium px-2 py-1 rounded-full bg-ink-100 text-ink-500';
      }
      if (loginSection) loginSection.classList.remove('hidden');
      if (loggedInSection) loggedInSection.classList.add('hidden');
    }
  }

  window.handleSignIn = handleSignIn;
  window.handleSignUp = handleSignUp;
  window.handleSignOut = handleSignOut;
  window.handleSyncFromCloud = handleSyncFromCloud;
  window.handleSyncToCloud = handleSyncToCloud;
  window.updateSyncStatus = updateSyncStatus;
})();
