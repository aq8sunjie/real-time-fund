'use client';

import { useEffect, useRef, useState } from 'react';

function PlusIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6l1-2h6l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a7.97 7.97 0 0 0 .1-2l2-1.5-2-3.5-2.3.5a8.02 8.02 0 0 0-1.7-1l-.4-2.3h-4l-.4 2.3a8.02 8.02 0 0 0-1.7 1l-2.3-.5-2 3.5 2 1.5a7.97 7.97 0 0 0 .1 2l-2 1.5 2 3.5 2.3-.5a8.02 8.02 0 0 0 1.7 1l.4 2.3h4l.4-2.3a8.02 8.02 0 0 0 1.7-1l2.3.5 2-3.5-2-1.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0 1 12.5-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 5h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 1-12.5 6.9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 19H5v-3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
      <path d="M16 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Stat({ label, value, delta }) {
  const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <span className={`value ${dir}`}>{value}</span>
      {typeof delta === 'number' && (
        <span className={`badge ${dir}`}>
          {delta > 0 ? '↗' : delta < 0 ? '↘' : '—'} {Math.abs(delta).toFixed(2)}%
        </span>
      )}
    </div>
  );
}

export default function HomePage() {
  const [funds, setFunds] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  
  // 刷新频率状态
  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);

  // 全局刷新状态
  const [refreshing, setRefreshing] = useState(false);

  // 收起/展开状态
  const [collapsedCodes, setCollapsedCodes] = useState(new Set());

  // 布局模式：card（卡片视图）或 compact（精简列表）
  const [viewMode, setViewMode] = useState('card');
  // 精简列表拖动排序
  const [dragIndex, setDragIndex] = useState(null);

  // 模拟持仓编辑
  const [editingHoldingCode, setEditingHoldingCode] = useState(null);
  const [tempHoldingAmount, setTempHoldingAmount] = useState('');
  const [tempHoldingProfit, setTempHoldingProfit] = useState('');

  // 加仓/减仓/定投/转换 弹窗
  const [actionType, setActionType] = useState(null); // 'add' | 'reduce' | 'fixed' | 'convert'
  const [actionFundCode, setActionFundCode] = useState('');
  const [actionAmount, setActionAmount] = useState('');
  const [convertTargetCode, setConvertTargetCode] = useState('');
  const [fixedAmountDefault, setFixedAmountDefault] = useState('500');
  const [buyFeeRate, setBuyFeeRate] = useState('0.15');   // 买入费率 %
  const [sellFeeRate, setSellFeeRate] = useState('0.5');  // 卖出费率 %

  // 汇总栏显示日期
  const todayStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  // 根据导航栏实际高度设置内容区顶部留白，实现机型自适应
  const navbarRef = useRef(null);
  useEffect(() => {
    const el = navbarRef.current;
    if (!el) return;
    const setPadding = () => {
      const height = el.getBoundingClientRect().height;
      // 留出足够间距，确保「账户资产总额」整行在导航栏下方不被遮挡
      const gap = 40;
      document.documentElement.style.setProperty('--navbar-content-gap', `${height + gap}px`);
    };
    setPadding();
    const ro = new ResizeObserver(setPadding);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'card' ? 'compact' : 'card';
      try {
        localStorage.setItem('viewMode', next);
      } catch {}
      return next;
    });
  };

  const handleCompactDragStart = (index) => {
    setDragIndex(index);
  };

  const handleCompactDragOver = (event, index) => {
    event.preventDefault();
    // 仅允许在不同元素上触发 drop
  };

  const handleCompactDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    setFunds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      try {
        localStorage.setItem('funds', JSON.stringify(next));
      } catch {}
      return next;
    });
    setDragIndex(null);
  };

  const handleCompactDragEnd = () => {
    setDragIndex(null);
  };

  const openHoldingEditor = (fund) => {
    setEditingHoldingCode(fund.code);
    setTempHoldingAmount(fund.holdingAmount != null ? String(fund.holdingAmount) : '');
    setTempHoldingProfit(fund.holdingProfit != null ? String(fund.holdingProfit) : '');
  };

  const closeHoldingEditor = () => {
    setEditingHoldingCode(null);
    setTempHoldingAmount('');
    setTempHoldingProfit('');
  };

  const saveHolding = (e) => {
    e?.preventDefault?.();
    if (editingHoldingCode == null) return;
    const amount = parseFloat(tempHoldingAmount);
    const profit = tempHoldingProfit === '' ? 0 : parseFloat(tempHoldingProfit);
    if (!Number.isFinite(amount) || amount < 0) return;
    if (!Number.isFinite(profit)) return;
    setFunds(prev => {
      const next = prev.map(f =>
        f.code === editingHoldingCode
          ? { ...f, holdingAmount: amount, holdingProfit: profit }
          : f
      );
      localStorage.setItem('funds', JSON.stringify(next));
      return next;
    });
    closeHoldingEditor();
  };

  const openHoldingAction = (type, fund) => {
    setActionType(type);
    setActionFundCode(fund.code);
    setActionAmount('');
    setConvertTargetCode('');
    if (type === 'fixed') {
      try {
        const saved = localStorage.getItem('fixedAmountDefault') || '500';
        setFixedAmountDefault(saved);
        setActionAmount(saved);
      } catch {
        setActionAmount('500');
      }
    }
  };

  const closeHoldingAction = () => {
    setActionType(null);
    setActionFundCode('');
    setActionAmount('');
    setConvertTargetCode('');
  };

  const applyAddPosition = (code, amount, feeRatePercent) => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0) return;
    const rate = Number.isFinite(feeRatePercent) ? feeRatePercent / 100 : 0;
    const actualAdd = num * (1 - rate);
    setFunds((prev) => {
      const next = prev.map((f) => {
        if (f.code !== code) return f;
        const cur = f.holdingAmount != null && Number.isFinite(f.holdingAmount) ? f.holdingAmount : 0;
        const profit = typeof f.holdingProfit === 'number' ? f.holdingProfit : 0;
        return { ...f, holdingAmount: cur + actualAdd, holdingProfit: profit };
      });
      try {
        localStorage.setItem('funds', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const applyReducePosition = (code, amount) => {
    const num = parseFloat(amount);
    const fund = funds.find((f) => f.code === code);
    if (!fund || !Number.isFinite(num) || num <= 0) return;
    const cur = fund.holdingAmount != null && Number.isFinite(fund.holdingAmount) ? fund.holdingAmount : 0;
    const profit = typeof fund.holdingProfit === 'number' ? fund.holdingProfit : 0;
    if (num >= cur) {
      setFunds((prev) => {
        const next = prev.map((f) => (f.code === code ? { ...f, holdingAmount: 0, holdingProfit: 0 } : f));
        try {
          localStorage.setItem('funds', JSON.stringify(next));
        } catch {}
        return next;
      });
    } else {
      const ratio = (cur - num) / cur;
      setFunds((prev) => {
        const next = prev.map((f) => {
          if (f.code !== code) return f;
          return { ...f, holdingAmount: cur - num, holdingProfit: profit * ratio };
        });
        try {
          localStorage.setItem('funds', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const applyConvert = (fromCode, toCode, amount) => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0 || fromCode === toCode) return;
    const fromFund = funds.find((f) => f.code === fromCode);
    const toFund = funds.find((f) => f.code === toCode);
    if (!fromFund || !toFund) return;
    const fromCur = fromFund.holdingAmount != null && Number.isFinite(fromFund.holdingAmount) ? fromFund.holdingAmount : 0;
    const fromProfit = typeof fromFund.holdingProfit === 'number' ? fromFund.holdingProfit : 0;
    const actualAmount = num >= fromCur ? fromCur : num;
    const fromRatio = fromCur <= 0 ? 1 : (fromCur - actualAmount) / fromCur;
    const toCur = toFund.holdingAmount != null && Number.isFinite(toFund.holdingAmount) ? toFund.holdingAmount : 0;
    const toProfit = typeof toFund.holdingProfit === 'number' ? toFund.holdingProfit : 0;
    setFunds((prev) => {
      const next = prev.map((f) => {
        if (f.code === fromCode) {
          return { ...f, holdingAmount: fromCur - actualAmount, holdingProfit: fromProfit * fromRatio };
        }
        if (f.code === toCode) {
          return { ...f, holdingAmount: toCur + actualAmount, holdingProfit: toProfit };
        }
        return f;
      });
      try {
        localStorage.setItem('funds', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const confirmHoldingAction = (e) => {
    e?.preventDefault?.();
    const amount = actionAmount.trim();
    const num = parseFloat(amount);
    const buyRate = parseFloat(buyFeeRate);
    const sellRate = parseFloat(sellFeeRate);
    if (actionType === 'add') {
      if (!Number.isFinite(num) || num <= 0) return;
      try {
        localStorage.setItem('buyFeeRate', buyFeeRate);
      } catch {}
      applyAddPosition(actionFundCode, amount, Number.isFinite(buyRate) ? buyRate : 0);
      closeHoldingAction();
    } else if (actionType === 'reduce') {
      if (!Number.isFinite(num) || num <= 0) return;
      try {
        localStorage.setItem('sellFeeRate', sellFeeRate);
      } catch {}
      applyReducePosition(actionFundCode, amount);
      closeHoldingAction();
    } else if (actionType === 'fixed') {
      if (!Number.isFinite(num) || num <= 0) return;
      try {
        localStorage.setItem('fixedAmountDefault', amount);
        localStorage.setItem('buyFeeRate', buyFeeRate);
      } catch {}
      applyAddPosition(actionFundCode, amount, Number.isFinite(buyRate) ? buyRate : 0);
      setFixedAmountDefault(amount);
      closeHoldingAction();
    } else if (actionType === 'convert') {
      if (!Number.isFinite(num) || num <= 0 || !convertTargetCode) return;
      applyConvert(actionFundCode, convertTargetCode, amount);
      closeHoldingAction();
    }
  };

  const toggleCollapse = (code) => {
    setCollapsedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('funds') || '[]');
      if (Array.isArray(saved) && saved.length) {
        // 先把本地保存的完整数据放入状态（包含模拟持仓等自定义字段）
        setFunds(saved);
        // 再基于这份数据按 code 刷新行情，同时保留本地的模拟持仓
        refreshAll(saved.map((f) => f.code), saved);
      }
      const savedMs = parseInt(localStorage.getItem('refreshMs') || '30000', 10);
      if (Number.isFinite(savedMs) && savedMs >= 5000) {
        setRefreshMs(savedMs);
        setTempSeconds(Math.round(savedMs / 1000));
      }
      const savedBuyRate = localStorage.getItem('buyFeeRate');
      if (savedBuyRate != null) setBuyFeeRate(savedBuyRate);
      const savedSellRate = localStorage.getItem('sellFeeRate');
      if (savedSellRate != null) setSellFeeRate(savedSellRate);
      const savedMode = localStorage.getItem('viewMode');
      if (savedMode === 'card' || savedMode === 'compact') {
        setViewMode(savedMode);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const codes = funds.map((f) => f.code);
      if (codes.length) refreshAll(codes);
    }, refreshMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [funds, refreshMs]);

  // --- 辅助：JSONP 数据抓取逻辑 ---
  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        document.body.removeChild(script);
        resolve();
      };
      script.onerror = () => {
        document.body.removeChild(script);
        reject(new Error('数据加载失败'));
      };
      document.body.appendChild(script);
    });
  };

  const fetchFundData = async (c) => {
    return new Promise(async (resolve, reject) => {
      // 腾讯接口识别逻辑优化
      const getTencentPrefix = (code) => {
        if (code.startsWith('6') || code.startsWith('9')) return 'sh';
        if (code.startsWith('0') || code.startsWith('3')) return 'sz';
        if (code.startsWith('4') || code.startsWith('8')) return 'bj';
        return 'sz';
      };

      const gzUrl = `https://fundgz.1234567.com.cn/js/${c}.js?rt=${Date.now()}`;
      
      // 使用更安全的方式处理全局回调，避免并发覆盖
      const currentCallback = `jsonpgz_${c}_${Math.random().toString(36).slice(2, 7)}`;
      
      // 动态拦截并处理 jsonpgz 回调
      const scriptGz = document.createElement('script');
      // 东方财富接口固定调用 jsonpgz，我们通过修改全局变量临时捕获它
      scriptGz.src = gzUrl;
      
      const originalJsonpgz = window.jsonpgz;
      window.jsonpgz = (json) => {
        window.jsonpgz = originalJsonpgz; // 立即恢复
        const gszzlNum = Number(json.gszzl);
        const gzData = {
          code: json.fundcode,
          name: json.name,
          dwjz: json.dwjz,
          gsz: json.gsz,
          gztime: json.gztime,
          gszzl: Number.isFinite(gszzlNum) ? gszzlNum : json.gszzl
        };
        
        // 获取重仓股票列表
        const holdingsUrl = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${c}&topline=10&year=&month=&rt=${Date.now()}`;
        loadScript(holdingsUrl).then(async () => {
          let holdings = [];
          const html = window.apidata?.content || '';
          const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
          for (const r of rows) {
            const cells = (r.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi) || []).map(td => td.replace(/<[^>]*>/g, '').trim());
            const codeIdx = cells.findIndex(txt => /^\d{6}$/.test(txt));
            const weightIdx = cells.findIndex(txt => /\d+(?:\.\d+)?\s*%/.test(txt));
            if (codeIdx >= 0 && weightIdx >= 0) {
              holdings.push({
                code: cells[codeIdx],
                name: cells[codeIdx + 1] || '',
                weight: cells[weightIdx],
                change: null
              });
            }
          }
          
          holdings = holdings.slice(0, 10);
          
          if (holdings.length) {
            try {
              const tencentCodes = holdings.map(h => `s_${getTencentPrefix(h.code)}${h.code}`).join(',');
              const quoteUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;
              
              await new Promise((resQuote) => {
                const scriptQuote = document.createElement('script');
                scriptQuote.src = quoteUrl;
                scriptQuote.onload = () => {
                  holdings.forEach(h => {
                    const varName = `v_s_${getTencentPrefix(h.code)}${h.code}`;
                    const dataStr = window[varName];
                    if (dataStr) {
                      const parts = dataStr.split('~');
                      // parts[5] 是涨跌幅
                      if (parts.length > 5) {
                        h.change = parseFloat(parts[5]);
                      }
                    }
                  });
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                scriptQuote.onerror = () => {
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                document.body.appendChild(scriptQuote);
              });
            } catch (e) {
              console.error('获取股票涨跌幅失败', e);
            }
          }
          
          resolve({ ...gzData, holdings });
        }).catch(() => resolve({ ...gzData, holdings: [] }));
      };

      scriptGz.onerror = () => {
        window.jsonpgz = originalJsonpgz;
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
        reject(new Error('基金数据加载失败'));
      };

      document.body.appendChild(scriptGz);
      // 加载完立即移除脚本
      setTimeout(() => {
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
      }, 5000);
    });
  };

  const refreshAll = async (codes, baseFunds) => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      // 改用串行请求，避免全局回调 jsonpgz 并发冲突
      const updated = [];
      const currentFunds = Array.isArray(baseFunds) && baseFunds.length ? baseFunds : funds;
      for (const c of codes) {
        const old = currentFunds.find(f => f.code === c);
        try {
          const data = await fetchFundData(c);
          // 保留用户填写的模拟持仓数据
          updated.push({
            ...data,
            holdingAmount: old?.holdingAmount,
            holdingProfit: old?.holdingProfit
          });
        } catch (e) {
          console.error(`刷新基金 ${c} 失败`, e);
          if (old) updated.push(old);
        }
      }
      if (updated.length) {
        setFunds(updated);
        localStorage.setItem('funds', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const addFund = async (e) => {
    e.preventDefault();
    setError('');
    const clean = code.trim();
    if (!clean) {
      setError('请输入基金编号');
      return;
    }
    if (funds.some((f) => f.code === clean)) {
      setError('该基金已添加');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchFundData(clean);
      const next = [data, ...funds];
      setFunds(next);
      localStorage.setItem('funds', JSON.stringify(next));
      setCode('');
    } catch (e) {
      setError(e.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const removeFund = (removeCode) => {
    const next = funds.filter((f) => f.code !== removeCode);
    setFunds(next);
    localStorage.setItem('funds', JSON.stringify(next));
  };

  const manualRefresh = async () => {
    if (refreshing) return;
    const codes = funds.map((f) => f.code);
    if (!codes.length) return;
    await refreshAll(codes);
  };

  const saveSettings = (e) => {
    e?.preventDefault?.();
    const ms = Math.max(5, Number(tempSeconds)) * 1000;
    setRefreshMs(ms);
    localStorage.setItem('refreshMs', String(ms));
    setSettingsOpen(false);
  };

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        if (settingsOpen) setSettingsOpen(false);
        if (editingHoldingCode) closeHoldingEditor();
        if (actionType) closeHoldingAction();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen, editingHoldingCode, actionType]);

  // 有持仓的基金：用于计算账户资产总额与当日收益
  const fundsWithHolding = funds.filter(
    (f) => f.holdingAmount != null && Number.isFinite(f.holdingAmount) && typeof f.gszzl === 'number'
  );
  const totalAssets = fundsWithHolding.reduce(
    (sum, f) => sum + f.holdingAmount * (1 + f.gszzl / 100),
    0
  );
  const totalDailyPnl = fundsWithHolding.reduce(
    (sum, f) => sum + f.holdingAmount * (f.gszzl / 100),
    0
  );

  return (
    <div className="container content">
      <div ref={navbarRef} className="navbar glass">
        {refreshing && <div className="loading-bar"></div>}
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
            <path d="M5 14c2-4 7-6 14-5" stroke="var(--primary)" strokeWidth="2" />
          </svg>
          <span>实时基金估值</span>
        </div>
        <div className="actions">
          <div className="badge" title="当前刷新频率">
            <span>刷新</span>
            <strong>{Math.round(refreshMs / 1000)}秒</strong>
          </div>
          <button
            type="button"
            className={`view-toggle ${viewMode === 'compact' ? 'active' : ''}`}
            onClick={toggleViewMode}
            title={viewMode === 'card' ? '切换为精简列表' : '切换为卡片视图'}
          >
            {viewMode === 'card' ? '精简' : '卡片'}
          </button>
          <button
            className="icon-button"
            aria-label="立即刷新"
            onClick={manualRefresh}
            disabled={refreshing || funds.length === 0}
            aria-busy={refreshing}
            title="立即刷新"
          >
            <RefreshIcon className={refreshing ? 'spin' : ''} width="18" height="18" />
          </button>
          <button
            className="icon-button"
            aria-label="打开设置"
            onClick={() => setSettingsOpen(true)}
            title="设置"
          >
            <SettingsIcon width="18" height="18" />
          </button>
        </div>
      </div>

      {fundsWithHolding.length > 0 && (
        <div className="summary-bar glass" role="region" aria-label="账户汇总">
          <div className="summary-row">
            <div className="summary-item">
              <span className="summary-label">账户资产总额</span>
              <span className="summary-value">{totalAssets.toFixed(2)} 元</span>
            </div>
            <div className="summary-item summary-item-with-time">
              <div>
                <span className="summary-label">当日收益</span>
                <span className={`summary-value ${totalDailyPnl >= 0 ? 'up' : 'down'}`}>
                  {totalDailyPnl >= 0 ? '+' : ''}{totalDailyPnl.toFixed(2)} 元
                </span>
              </div>
              <span className="summary-time" title="当前日期">
                {todayStr}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="col-12 glass card add-fund-section" role="region" aria-label="添加基金">
          <div className="title" style={{ marginBottom: 12 }}>
            <PlusIcon width="20" height="20" />
            <span>添加基金</span>
            <span className="muted">输入基金编号（例如：110022）</span>
          </div>
          <form className="form" onSubmit={addFund}>
            <input
              className="input"
              placeholder="基金编号"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
            />
            <button className="button" type="submit" disabled={loading}>
              {loading ? '添加中…' : '添加'}
            </button>
          </form>
          {error && <div className="muted" style={{ marginTop: 8, color: 'var(--danger)' }}>{error}</div>}
        </div>

        <div className="col-12">
          {funds.length === 0 ? (
            <div className="glass card empty">尚未添加基金</div>
          ) : viewMode === 'compact' ? (
            <div className="glass card fund-list-compact" role="region" aria-label="基金精简列表">
              {funds.map((f, index) => {
                const hasHolding = f.holdingAmount != null && Number.isFinite(f.holdingAmount) && typeof f.gszzl === 'number';
                const dailyPnl = hasHolding ? f.holdingAmount * (f.gszzl / 100) : null;
                return (
                  <button
                    key={f.code}
                    type="button"
                    className={`fund-row ${dragIndex === index ? 'dragging' : ''}`}
                    aria-label={`${f.name} 精简信息（可拖动排序）`}
                    draggable
                    onDragStart={() => handleCompactDragStart(index)}
                    onDragOver={(e) => handleCompactDragOver(e, index)}
                    onDrop={() => handleCompactDrop(index)}
                    onDragEnd={handleCompactDragEnd}
                  >
                    <div className="fund-row-main">
                      <div className="fund-row-name">
                        <span className="name">{f.name}</span>
                        <span className="code">#{f.code}</span>
                      </div>
                      <div className="fund-row-right">
                        <span className={`pct ${Number(f.gszzl) >= 0 ? 'up' : 'down'}`}>
                          {typeof f.gszzl === 'number' ? `${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—'}
                        </span>
                      </div>
                    </div>
                    <div className="fund-row-sub">
                      <span className="time">{f.gztime || f.time || '-'}</span>
                      {hasHolding ? (
                        <span className={`pnl ${dailyPnl >= 0 ? 'up' : 'down'}`}>
                          当日盈亏 {dailyPnl >= 0 ? '+' : ''}{dailyPnl.toFixed(2)} 元
                        </span>
                      ) : (
                        <span className="pnl muted">未设置持仓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid">
              {funds.map((f) => (
                <div key={f.code} className="col-6">
                  <div className="glass card">
                    <div className="row" style={{ marginBottom: 10 }}>
                      <div className="title">
                        <span>{f.name}</span>
                        <span className="muted">#{f.code}</span>
                      </div>
                      <div className="actions">
                        <div className="badge-v">
                          <span>估值时间</span>
                          <strong>{f.gztime || f.time || '-'}</strong>
                        </div>
                        <button
                          className="icon-button danger"
                          onClick={() => removeFund(f.code)}
                          title="删除"
                        >
                          <TrashIcon width="18" height="18" />
                        </button>
                      </div>
                    </div>
                    <div className="row" style={{ marginBottom: 12 }}>
                      <Stat label="单位净值" value={f.dwjz ?? '—'} />
                      <Stat label="估值净值" value={f.gsz ?? '—'} />
                      <Stat label="涨跌幅" value={typeof f.gszzl === 'number' ? `${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—'} delta={Number(f.gszzl) || 0} />
                    </div>

                    <div className="holding-section">
                      <div className="holding-header">
                        <WalletIcon width="16" height="16" className="muted" />
                        <span>模拟持仓</span>
                        {f.holdingAmount != null && Number.isFinite(f.holdingAmount) ? (
                          <button
                            type="button"
                            className="link-button"
                            onClick={() => openHoldingEditor(f)}
                            title="编辑持仓"
                          >
                            编辑
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="link-button"
                            onClick={() => openHoldingEditor(f)}
                            title="设置持仓"
                          >
                            设置持仓
                          </button>
                        )}
                      </div>
                      {f.holdingAmount != null && Number.isFinite(f.holdingAmount) && typeof f.gszzl === 'number' ? (() => {
                        const profit = typeof f.holdingProfit === 'number' ? f.holdingProfit : 0;
                        const cost = f.holdingAmount - profit;
                        const dailyPnl = f.holdingAmount * (f.gszzl / 100);
                        const estimatedValue = f.holdingAmount * (1 + f.gszzl / 100);
                        const totalProfit = profit + dailyPnl;
                        return (
                          <div className="holding-stats">
                            <div className="holding-row">
                              <span className="label">持仓成本</span>
                              <span className="value">{cost.toFixed(2)} 元</span>
                            </div>
                            <div className="holding-row">
                              <span className="label">估值市值</span>
                              <span className="value">{estimatedValue.toFixed(2)} 元</span>
                            </div>
                            <div className="holding-row">
                              <span className="label">持有收益</span>
                              <span className={`value ${totalProfit >= 0 ? 'up' : 'down'}`}>
                                {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} 元
                              </span>
                            </div>
                            <div className="holding-row highlight">
                              <span className="label">当日盈亏</span>
                              <span className={`value ${dailyPnl >= 0 ? 'up' : 'down'}`}>
                                {dailyPnl >= 0 ? '+' : ''}{dailyPnl.toFixed(2)} 元
                              </span>
                            </div>
                            <div className="holding-actions">
                              <button type="button" className="holding-action-btn" onClick={() => openHoldingAction('add', f)} title="加仓">加仓</button>
                              <button type="button" className="holding-action-btn" onClick={() => openHoldingAction('reduce', f)} title="减仓">减仓</button>
                              <button type="button" className="holding-action-btn" onClick={() => openHoldingAction('fixed', f)} title="定投">定投</button>
                              <button type="button" className="holding-action-btn" onClick={() => openHoldingAction('convert', f)} title="转换">转换</button>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="muted holding-hint">填写持有金额与持有收益，随估值计算当日盈亏</div>
                      )}
                    </div>

                    <div 
                      style={{ marginBottom: 8, cursor: 'pointer', userSelect: 'none' }} 
                      className="title"
                      onClick={() => toggleCollapse(f.code)}
                    >
                      <div className="row" style={{ width: '100%', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>前10重仓股票</span>
                          <ChevronIcon 
                            width="16" 
                            height="16" 
                            className="muted"
                            style={{ 
                              transform: collapsedCodes.has(f.code) ? 'rotate(-90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }} 
                          />
                        </div>
                        <span className="muted">涨跌幅 / 占比</span>
                      </div>
                    </div>
                    {Array.isArray(f.holdings) && f.holdings.length ? (
                      <div className={`list ${collapsedCodes.has(f.code) ? 'collapsed' : ''}`} style={{ 
                        display: collapsedCodes.has(f.code) ? 'none' : 'grid'
                      }}>
                        {f.holdings.map((h, idx) => (
                          <div className="item" key={idx}>
                            <span className="name">{h.name}</span>
                            <div className="values">
                              {typeof h.change === 'number' && (
                                <span className={`badge ${h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}`} style={{ marginRight: 8 }}>
                                  {h.change > 0 ? '+' : ''}{h.change.toFixed(2)}%
                                </span>
                              )}
                              <span className="weight">{h.weight}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="muted" style={{ display: collapsedCodes.has(f.code) ? 'none' : 'block' }}>暂无重仓数据</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="footer">数据源：实时估值与重仓直连东方财富，无需后端，部署即用</div>

      {settingsOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="设置" onClick={() => setSettingsOpen(false)}>
          <div className="glass card modal" onClick={(e) => e.stopPropagation()}>
            <div className="title" style={{ marginBottom: 12 }}>
              <SettingsIcon width="20" height="20" />
              <span>设置</span>
              <span className="muted">配置刷新频率</span>
            </div>
            
            <div className="form-group" style={{ marginBottom: 16 }}>
              <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>刷新频率</div>
              <div className="chips" style={{ marginBottom: 12 }}>
                {[10, 30, 60, 120, 300].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${tempSeconds === s ? 'active' : ''}`}
                    onClick={() => setTempSeconds(s)}
                    aria-pressed={tempSeconds === s}
                  >
                    {s} 秒
                  </button>
                ))}
              </div>
              <input
                className="input"
                type="number"
                min="5"
                step="5"
                value={tempSeconds}
                onChange={(e) => setTempSeconds(Number(e.target.value))}
                placeholder="自定义秒数"
              />
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="button" onClick={saveSettings}>保存并关闭</button>
            </div>
          </div>
        </div>
      )}

      {editingHoldingCode != null && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="设置模拟持仓" onClick={closeHoldingEditor}>
          <div className="glass card modal" onClick={(e) => e.stopPropagation()}>
            <div className="title" style={{ marginBottom: 12 }}>
              <WalletIcon width="20" height="20" />
              <span>模拟持仓</span>
              <span className="muted">持有金额与持有收益，用于计算当日盈亏</span>
            </div>
            <form onSubmit={saveHolding}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="muted" style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem' }}>持有金额（元）</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={tempHoldingAmount}
                  onChange={(e) => setTempHoldingAmount(e.target.value)}
                  placeholder="例如 10000"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="muted" style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem' }}>持有收益（元，正为盈利负为亏损）</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={tempHoldingProfit}
                  onChange={(e) => setTempHoldingProfit(e.target.value)}
                  placeholder="例如 500 或 -200"
                />
              </div>
              <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button type="button" className="button secondary" onClick={closeHoldingEditor}>取消</button>
                <button type="submit" className="button" onClick={saveHolding}>保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionType != null && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={actionType === 'add' ? '加仓' : actionType === 'reduce' ? '减仓' : actionType === 'fixed' ? '定投' : '转换'} onClick={closeHoldingAction}>
          <div className="glass card modal" onClick={(e) => e.stopPropagation()}>
            <div className="title" style={{ marginBottom: 12 }}>
              <WalletIcon width="20" height="20" />
              <span>{actionType === 'add' ? '同步加仓' : actionType === 'reduce' ? '同步减仓' : actionType === 'fixed' ? '同步定投' : '同步转换'}</span>
              <span className="muted">
                {actionType === 'add' && '增加持仓金额，持有收益不变'}
                {actionType === 'reduce' && '按金额减少持仓，收益按比例减少'}
                {actionType === 'fixed' && '按定投金额一次性加仓'}
                {actionType === 'convert' && '从本基金减仓并加仓到目标基金'}
              </span>
            </div>
            <form onSubmit={confirmHoldingAction}>
              {(actionType === 'add' || actionType === 'fixed') && (
                <>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="muted" style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem' }}>
                      {actionType === 'add' ? '加仓金额（元）' : '定投金额（元）'}
                    </label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      placeholder="例如 500"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="muted" style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem' }}>买入费率（%）</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={buyFeeRate}
                      onChange={(e) => setBuyFeeRate(e.target.value)}
                      placeholder="例如 0.15"
                    />
                  </div>
                  {actionAmount.trim() && (() => {
                    const amt = parseFloat(actionAmount);
                    const rate = parseFloat(buyFeeRate);
                    const fee = Number.isFinite(amt) && amt > 0 && Number.isFinite(rate) && rate >= 0 ? (amt * rate / 100).toFixed(2) : null;
                    return fee != null ? (
                      <div className="muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
                        估算手续费：<strong style={{ color: 'var(--text)' }}>{fee} 元</strong>
                        <span style={{ marginLeft: 8, opacity: 0.8 }}>实际增加持仓 ≈ {(amt - amt * rate / 100).toFixed(2)} 元</span>
                      </div>
                    ) : null;
                  })()}
                </>
              )}
              {actionType === 'reduce' && (() => {
                const actionFund = funds.find((f) => f.code === actionFundCode);
                const curHolding = actionFund?.holdingAmount != null && Number.isFinite(actionFund.holdingAmount) ? actionFund.holdingAmount : 0;
                return (
                  <>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="muted" style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem' }}>卖出金额（元）· 可选比例快速填入</label>
                      <div className="chips" style={{ marginBottom: 8 }}>
                        {[
                          { label: '1/4', ratio: 1/4 },
                          { label: '1/3', ratio: 1/3 },
                          { label: '1/2', ratio: 1/2 },
                          { label: '全部', ratio: 1 },
                        ].map(({ label, ratio }) => (
                          <button
                            key={label}
                            type="button"
                            className="chip"
                            onClick={() => setActionAmount((curHolding * ratio).toFixed(2))}
                            aria-pressed={actionAmount === (curHolding * ratio).toFixed(2)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        placeholder="不超过当前持仓"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="muted" style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem' }}>卖出费率（%）</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={sellFeeRate}
                        onChange={(e) => setSellFeeRate(e.target.value)}
                        placeholder="例如 0.5"
                      />
                    </div>
                    {actionAmount.trim() && (() => {
                      const amt = parseFloat(actionAmount);
                      const rate = parseFloat(sellFeeRate);
                      const fee = Number.isFinite(amt) && amt > 0 && Number.isFinite(rate) && rate >= 0 ? (amt * rate / 100).toFixed(2) : null;
                      return fee != null ? (
                        <div className="muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
                          估算手续费：<strong style={{ color: 'var(--text)' }}>{fee} 元</strong>
                          <span style={{ marginLeft: 8, opacity: 0.8 }}>预计到账 ≈ {(amt - amt * rate / 100).toFixed(2)} 元</span>
                        </div>
                      ) : null;
                    })()}
                  </>
                );
              })()}
              {actionType === 'convert' && (
                <>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="muted" style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem' }}>转换金额（元）</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      placeholder="转入目标基金的金额"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="muted" style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem' }}>目标基金</label>
                    <select
                      className="input"
                      value={convertTargetCode}
                      onChange={(e) => setConvertTargetCode(e.target.value)}
                      style={{ width: '100%', cursor: 'pointer' }}
                    >
                      <option value="">请选择目标基金</option>
                      {funds.filter((f) => f.code !== actionFundCode).map((f) => (
                        <option key={f.code} value={f.code}>{f.name} #{f.code}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <button type="button" className="button secondary" onClick={closeHoldingAction}>取消</button>
                <button type="submit" className="button" onClick={confirmHoldingAction}>确认</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
