'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import BackspaceIcon from '@mui/icons-material/Backspace';

// Dictionary for translations
const i18n = {
  en: {
    tool_name: "Calculator",
    title: "⚡ Universal Calculator",
    scientificCalc: "Scientific Calculator",
    interestCalc: "Interest Calculator",
    subnetCalc: "Subnet Calculator",
    unitConv: "Unit Converter",
    loanAmount: "Loan Amount",
    loanTerm: "Loan Term (months)",
    annualRate: "Annual Rate (%)",
    repaymentMethod: "Repayment Method",
    equalPayment: "Equal Payment",
    equalPrincipal: "Equal Principal",
    calculate: "Calculate",
    monthlyPayment: "Monthly Payment",
    totalPayment: "Total Payment",
    totalInterest: "Total Interest",
    firstMonthPayment: "First Month Payment",
    lastMonthPayment: "Last Month Payment",
    monthlyDecrease: "Monthly Decrease",
    ipAddress: "IP Address",
    cidrLabel: "CIDR / Subnet Mask Bits",
    subnetMask: "Subnet Mask",
    wildcardMask: "Wildcard Mask",
    networkAddress: "Network Address",
    broadcastAddress: "Broadcast Address",
    hostRange: "Usable Host Range",
    hostCount: "Usable Hosts",
    ipBinary: "IP Binary",
    expression: "Expression",
    result: "Result",
    history: "History",
    noHistory: "No history yet",
    clearHistory: "Clear History",
    rad: "RAD",
    deg: "DEG",
  },
  zh: {
    tool_name: "计算器",
    title: "⚡ 万能计算器",
    scientificCalc: "科学计算器",
    interestCalc: "利息计算器",
    subnetCalc: "子网掩码计算器",
    unitConv: "单位换算器",
    loanAmount: "贷款金额",
    loanTerm: "贷款期限 (月)",
    annualRate: "年利率 (%)",
    repaymentMethod: "还款方式",
    equalPayment: "等额本息",
    equalPrincipal: "等额本金",
    calculate: "计算",
    monthlyPayment: "每月还款",
    totalPayment: "总还款额",
    totalInterest: "总利息",
    firstMonthPayment: "首月还款",
    lastMonthPayment: "末月还款",
    monthlyDecrease: "每月递减",
    ipAddress: "IP 地址",
    cidrLabel: "CIDR / 子网掩码位数",
    subnetMask: "子网掩码",
    wildcardMask: "反子网掩码",
    networkAddress: "网络地址",
    broadcastAddress: "广播地址",
    hostRange: "可用主机范围",
    hostCount: "可用主机数",
    ipBinary: "IP 二进制",
    expression: "表达式",
    result: "结果",
    history: "历史记录",
    noHistory: "暂无历史记录",
    clearHistory: "清除历史",
    rad: "弧度",
    deg: "角度",
  }
};

const lengthUnits = {
  m: { en: 'Meter (m)', zh: '米 (m)', value: 1 },
  km: { en: 'Kilometer (km)', zh: '千米 (km)', value: 1000 },
  cm: { en: 'Centimeter (cm)', zh: '厘米 (cm)', value: 0.01 },
  mm: { en: 'Millimeter (mm)', zh: '毫米 (mm)', value: 0.001 },
  um: { en: 'Micrometer (μm)', zh: '微米 (μm)', value: 1e-6 },
  nm: { en: 'Nanometer (nm)', zh: '纳米 (nm)', value: 1e-9 },
  in: { en: 'Inch (in)', zh: '英寸 (in)', value: 0.0254 },
  ft: { en: 'Foot (ft)', zh: '英尺 (ft)', value: 0.3048 },
  yd: { en: 'Yard (yd)', zh: '码 (yd)', value: 0.9144 },
  mi: { en: 'Mile (mi)', zh: '英里 (mi)', value: 1609.344 },
  nmi: { en: 'Nautical Mile (nmi)', zh: '海里 (nmi)', value: 1852 },
  li: { en: 'Li (里)', zh: '里', value: 500 },
  zhang: { en: 'Zhang (丈)', zh: '丈', value: 3.33333 },
  chi: { en: 'Chi (尺)', zh: '尺', value: 0.33333 },
  cun: { en: 'Cun (寸)', zh: '寸', value: 0.03333 },
};

const areaUnits = {
  m2: { en: 'Square Meter (m²)', zh: '平方米 (m²)', value: 1 },
  km2: { en: 'Square Kilometer (km²)', zh: '平方千米 (km²)', value: 1e6 },
  cm2: { en: 'Square Centimeter (cm²)', zh: '平方厘米 (cm²)', value: 1e-4 },
  mm2: { en: 'Square Millimeter (mm²)', zh: '平方毫米 (mm²)', value: 1e-6 },
  ha: { en: 'Hectare (ha)', zh: '公顷 (ha)', value: 10000 },
  mu: { en: 'Mu (亩)', zh: '亩', value: 666.667 },
  sqft: { en: 'Square Foot (ft²)', zh: '平方英尺 (ft²)', value: 0.092903 },
  sqyd: { en: 'Square Yard (yd²)', zh: '平方码 (yd²)', value: 0.836127 },
  sqmi: { en: 'Square Mile (mi²)', zh: '平方英里 (mi²)', value: 2589988.11 },
  acre: { en: 'Acre', zh: '英亩', value: 4046.86 },
};

const volumeUnits = {
  l: { en: 'Liter (L)', zh: '升 (L)', value: 1 },
  ml: { en: 'Milliliter (mL)', zh: '毫升 (mL)', value: 0.001 },
  m3: { en: 'Cubic Meter (m³)', zh: '立方米 (m³)', value: 1000 },
  cm3: { en: 'Cubic Centimeter (cm³)', zh: '立方厘米 (cm³)', value: 0.001 },
  mm3: { en: 'Cubic Millimeter (mm³)', zh: '立方毫米 (mm³)', value: 1e-6 },
  gal: { en: 'Gallon (US)', zh: '加仑 (美)', value: 3.78541 },
  qt: { en: 'Quart (US)', zh: '夸脱 (美)', value: 0.946353 },
  pt: { en: 'Pint (US)', zh: '品脱 (美)', value: 0.473176 },
  cup: { en: 'Cup (US)', zh: '杯 (美)', value: 0.236588 },
  floz: { en: 'Fluid Ounce (US)', zh: '液盎司 (美)', value: 0.0295735 },
  tbsp: { en: 'Tablespoon', zh: '汤匙', value: 0.0147868 },
  tsp: { en: 'Teaspoon', zh: '茶匙', value: 0.00492892 },
};

const tempUnits = {
  c: { en: 'Celsius (°C)', zh: '摄氏度 (°C)', value: 1 },
  f: { en: 'Fahrenheit (°F)', zh: '华氏度 (°F)', value: 1 },
  k: { en: 'Kelvin (K)', zh: '开氏度 (K)', value: 1 },
};

const timeUnits = {
  ms: { en: 'Millisecond (ms)', zh: '毫秒 (ms)', value: 0.001 },
  s: { en: 'Second (s)', zh: '秒 (s)', value: 1 },
  min: { en: 'Minute (min)', zh: '分 (min)', value: 60 },
  h: { en: 'Hour (h)', zh: '小时 (h)', value: 3600 },
  d: { en: 'Day (d)', zh: '天 (d)', value: 86400 },
  w: { en: 'Week (w)', zh: '周 (w)', value: 604800 },
  mo: { en: 'Month (mo)', zh: '月 (mo)', value: 2592000 },
  y: { en: 'Year (y)', zh: '年 (y)', value: 31536000 },
};

const speedUnits = {
  mps: { en: 'm/s', zh: '米/秒', value: 1 },
  kmh: { en: 'km/h', zh: '千米/小时', value: 0.277778 },
  mph: { en: 'mph', zh: '英里/小时', value: 0.44704 },
  knot: { en: 'Knot', zh: '节', value: 0.514444 },
  mach: { en: 'Mach', zh: '马赫', value: 340.29 },
  fps: { en: 'ft/s', zh: '英尺/秒', value: 0.3048 },
  c: { en: 'Speed of Light (c)', zh: '光速 (c)', value: 299792458 },
};

const dataUnits = {
  b: { en: 'Byte (B)', zh: '字节 (B)', value: 1 },
  kb: { en: 'Kilobyte (KB)', zh: '千字节 (KB)', value: 1000 },
  mb: { en: 'Megabyte (MB)', zh: '兆字节 (MB)', value: 1e6 },
  gb: { en: 'Gigabyte (GB)', zh: '吉字节 (GB)', value: 1e9 },
  tb: { en: 'Terabyte (TB)', zh: '太字节 (TB)', value: 1e12 },
  pb: { en: 'Petabyte (PB)', zh: '拍字节 (PB)', value: 1e15 },
  kib: { en: 'Kibibyte (KiB)', zh: '千位二进制字节 (KiB)', value: 1024 },
  mib: { en: 'Mebibyte (MiB)', zh: '兆位二进制字节 (MiB)', value: 1048576 },
  gib: { en: 'Gibibyte (GiB)', zh: '吉位二进制字节 (GiB)', value: 1073741824 },
  tib: { en: 'Tebibyte (TiB)', zh: '太位二进制字节 (TiB)', value: 1099511627776 },
  bit: { en: 'Bit', zh: '比特', value: 0.125 },
};

const pressureUnits = {
  pa: { en: 'Pascal (Pa)', zh: '帕斯卡 (Pa)', value: 1 },
  kpa: { en: 'Kilopascal (kPa)', zh: '千帕斯卡 (kPa)', value: 1000 },
  mpa: { en: 'Megapascal (MPa)', zh: '兆帕斯卡 (MPa)', value: 1e6 },
  bar: { en: 'Bar', zh: '巴', value: 100000 },
  atm: { en: 'Atmosphere (atm)', zh: '标准大气压 (atm)', value: 101325 },
  psi: { en: 'psi', zh: '磅力/平方英寸', value: 6894.76 },
  mmhg: { en: 'mmHg', zh: '毫米汞柱', value: 133.322 },
  torr: { en: 'Torr', zh: '托', value: 133.322 },
};

const powerUnits = {
  w: { en: 'Watt (W)', zh: '瓦特 (W)', value: 1 },
  kw: { en: 'Kilowatt (kW)', zh: '千瓦 (kW)', value: 1000 },
  mw: { en: 'Megawatt (mW)', zh: '兆瓦 (mW)', value: 1e6 },
  hp: { en: 'Horsepower (hp)', zh: '马力 (hp)', value: 745.7 },
  ps: { en: 'Metric Horsepower (ps)', zh: '公制马力 (ps)', value: 735.499 },
  btuh: { en: 'BTU/h', zh: '英热单位/小时', value: 0.293071 },
  ftlbs: { en: 'ft·lb/s', zh: '英尺·磅/秒', value: 1.35582 },
};

const energyUnits = {
  j: { en: 'Joule (J)', zh: '焦耳 (J)', value: 1 },
  kj: { en: 'Kilojoule (kJ)', zh: '千焦耳 (kJ)', value: 1000 },
  cal: { en: 'Calorie (cal)', zh: '卡路里 (cal)', value: 4.184 },
  kcal: { en: 'Kilocalorie (kcal)', zh: '千卡 (kcal)', value: 4184 },
  wh: { en: 'Watt-hour (Wh)', zh: '瓦时 (Wh)', value: 3600 },
  kwh: { en: 'Kilowatt-hour (kWh)', zh: '千瓦时 (kWh)', value: 3600000 },
  btu: { en: 'BTU', zh: '英热单位', value: 1055.06 },
  ev: { en: 'Electronvolt (eV)', zh: '电子伏特 (eV)', value: 1.60218e-19 },
};

const angleUnits = {
  deg: { en: 'Degree (°)', zh: '度 (°)', value: 1 },
  rad: { en: 'Radian (rad)', zh: '弧度 (rad)', value: 57.2958 },
  grad: { en: 'Gradian (grad)', zh: '百分度 (grad)', value: 0.9 },
  turn: { en: 'Turn', zh: '圈', value: 360 },
  arcmin: { en: 'Arcminute', zh: '分', value: 1 / 60 },
  arcsec: { en: 'Arcsecond', zh: '秒', value: 1 / 3600 },
};

const densityUnits = {
  kgm3: { en: 'kg/m³', zh: '千克/立方米', value: 1 },
  gcm3: { en: 'g/cm³', zh: '克/立方厘米', value: 1000 },
  gml: { en: 'g/mL', zh: '克/毫升', value: 1000 },
  kgl: { en: 'kg/L', zh: '千克/升', value: 1000 },
  lbft3: { en: 'lb/ft³', zh: '磅/立方英尺', value: 16.0185 },
  lbin3: { en: 'lb/in³', zh: '磅/立方英寸', value: 27679.9 },
};

const forceUnits = {
  n: { en: 'Newton (N)', zh: '牛顿 (N)', value: 1 },
  kn: { en: 'Kilonewton (kN)', zh: '千牛顿 (kN)', value: 1000 },
  dyn: { en: 'Dyne (dyn)', zh: '达因 (dyn)', value: 1e-5 },
  lbf: { en: 'Pound-force (lbf)', zh: '磅力 (lbf)', value: 4.44822 },
  kgf: { en: 'Kilogram-force (kgf)', zh: '千克力 (kgf)', value: 9.80665 },
  gf: { en: 'Gram-force (gf)', zh: '克力 (gf)', value: 0.00980665 },
  ozf: { en: 'Ounce-force (ozf)', zh: '盎司力 (ozf)', value: 0.278014 },
};

const unitCategories = {
  length: { label: { en: 'Length', zh: '长度' }, units: lengthUnits },
  area: { label: { en: 'Area', zh: '面积' }, units: areaUnits },
  volume: { label: { en: 'Volume', zh: '体积' }, units: volumeUnits },
  temp: { label: { en: 'Temperature', zh: '温度' }, units: tempUnits },
  time: { label: { en: 'Time', zh: '时间' }, units: timeUnits },
  speed: { label: { en: 'Speed', zh: '速度' }, units: speedUnits },
  data: { label: { en: 'Data Size', zh: '数据大小' }, units: dataUnits },
  pressure: { label: { en: 'Pressure', zh: '压力' }, units: pressureUnits },
  power: { label: { en: 'Power', zh: '功率' }, units: powerUnits },
  energy: { label: { en: 'Energy', zh: '能量' }, units: energyUnits },
  angle: { label: { en: 'Angle', zh: '角度' }, units: angleUnits },
  density: { label: { en: 'Density', zh: '密度' }, units: densityUnits },
  force: { label: { en: 'Force', zh: '力' }, units: forceUnits },
};

export default function Calculator() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [activeTab, setActiveTab] = useState<number>(0);

  const t = i18n[lang];

  // ==========================================
  // Scientific Calculator State & Handlers
  // ==========================================
  const [expression, setExpression] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string>('0');
  const [calcHistory, setCalcHistory] = useState<Array<{ expr: string; res: string }>>([]);
  const [isRadian, setIsRadian] = useState<boolean>(false);

  const handleClear = () => {
    setExpression('');
    setCalcResult('0');
  };

  const handleBackspace = () => {
    setExpression((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
  };

  const handleInput = (val: string) => {
    setExpression((prev) => prev + val);
  };

  const handleScientificFunc = (func: string) => {
    const current = parseFloat(expression || calcResult) || 0;
    let computed = 0;
    let logStr = `${func}(${current})`;

    switch (func) {
      case 'sin':
        computed = isRadian ? Math.sin(current) : Math.sin((current * Math.PI) / 180);
        break;
      case 'cos':
        computed = isRadian ? Math.cos(current) : Math.cos((current * Math.PI) / 180);
        break;
      case 'tan':
        computed = isRadian ? Math.tan(current) : Math.tan((current * Math.PI) / 180);
        break;
      case 'log':
        computed = Math.log10(current);
        break;
      case 'ln':
        computed = Math.log(current);
        break;
      case 'sqrt':
        computed = Math.sqrt(current);
        break;
      case 'pow2':
        computed = Math.pow(current, 2);
        logStr = `(${current})²`;
        break;
      case 'pow3':
        computed = Math.pow(current, 3);
        logStr = `(${current})³`;
        break;
      case 'factorial':
        const fact = (n: number): number => {
          if (n < 0) return NaN;
          if (n === 0 || n === 1) return 1;
          let r = 1;
          for (let i = 2; i <= n; i++) r *= i;
          return r;
        };
        computed = fact(Math.floor(current));
        logStr = `${Math.floor(current)}!`;
        break;
      case 'percent':
        computed = current / 100;
        logStr = `${current}%`;
        break;
      case 'abs':
        computed = Math.abs(current);
        break;
      default:
        return;
    }

    const resStr = computed.toString();
    setCalcResult(resStr);
    setExpression(resStr);
    setCalcHistory((prev) => [{ expr: logStr, res: resStr }, ...prev]);
  };

  const handleEvaluate = useCallback(() => {
    if (!expression) return;
    try {
      // Build safe mathematical environment
      const sin = (x: number) => (isRadian ? Math.sin(x) : Math.sin((x * Math.PI) / 180));
      const cos = (x: number) => (isRadian ? Math.cos(x) : Math.cos((x * Math.PI) / 180));
      const tan = (x: number) => (isRadian ? Math.tan(x) : Math.tan((x * Math.PI) / 180));
      const log = (x: number) => Math.log10(x);
      const ln = (x: number) => Math.log(x);
      const sqrt = (x: number) => Math.sqrt(x);
      const abs = (x: number) => Math.abs(x);
      const fact = (n: number): number => {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
      };

      let exprToEval = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Simple execution sandbox via Function
      const evaluator = new Function(
        'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs', 'fact',
        `return (${exprToEval});`
      );

      const result = evaluator(sin, cos, tan, log, ln, sqrt, abs, fact);
      const resStr = result.toString();
      setCalcResult(resStr);
      setCalcHistory((prev) => [{ expr: expression, res: resStr }, ...prev]);
      setExpression(resStr);
    } catch (e) {
      setCalcResult('Error');
    }
  }, [expression, isRadian]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 0) return;
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key;
      if (/[0-9.+\-*/()^%]/.test(key)) {
        e.preventDefault();
        setExpression((prev) => prev + key);
      } else if (key === 'Enter') {
        e.preventDefault();
        handleEvaluate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleEvaluate]);

  // ==========================================
  // Interest Calculator State & Handlers
  // ==========================================
  const [loanAmount, setLoanAmount] = useState<string>('100000');
  const [loanTerm, setLoanTerm] = useState<string>('12');
  const [loanRate, setLoanRate] = useState<string>('5');
  const [repaymentType, setRepaymentType] = useState<'equal' | 'principal'>('equal');
  const [interestResult, setInterestResult] = useState<{
    monthlyPay: string;
    firstMonthPay?: string;
    lastMonthPay?: string;
    monthlyDecrease?: string;
    totalPay: string;
    totalInterest: string;
  } | null>(null);

  const calculateLoan = () => {
    const amount = parseFloat(loanAmount) || 0;
    const months = parseInt(loanTerm) || 0;
    const yearRate = (parseFloat(loanRate) || 0) / 100;
    const monthRate = yearRate / 12;

    if (amount <= 0 || months <= 0) return;

    if (repaymentType === 'equal') {
      const monthlyPay =
        monthRate === 0
          ? amount / months
          : (amount * monthRate * Math.pow(1 + monthRate, months)) /
            (Math.pow(1 + monthRate, months) - 1);
      const totalPay = monthlyPay * months;
      const totalInterest = totalPay - amount;

      setInterestResult({
        monthlyPay: monthlyPay.toFixed(2),
        totalPay: totalPay.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
      });
    } else {
      const monthPrincipal = amount / months;
      const firstMonthPay = monthPrincipal + amount * monthRate;
      const lastMonthPay = monthPrincipal + monthPrincipal * monthRate;
      const totalInterest = ((months + 1) * amount * monthRate) / 2;
      const totalPay = amount + totalInterest;
      const monthlyDecrease = monthPrincipal * monthRate;

      setInterestResult({
        monthlyPay: '',
        firstMonthPay: firstMonthPay.toFixed(2),
        lastMonthPay: lastMonthPay.toFixed(2),
        monthlyDecrease: monthlyDecrease.toFixed(2),
        totalPay: totalPay.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
      });
    }
  };

  // ==========================================
  // Subnet Calculator State & Handlers
  // ==========================================
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.1');
  const [cidr, setCidr] = useState<number>(24);
  const [subnetResult, setSubnetResult] = useState<{
    subnet: string;
    wildcard: string;
    network: string;
    broadcast: string;
    range: string;
    hosts: number;
    binary: string;
  } | null>(null);

  const calculateSubnet = () => {
    const parts = ipAddress.split('.').map((p) => parseInt(p) || 0);
    if (parts.length !== 4) return;

    const mask: number[] = [];
    for (let i = 0; i < 4; i++) {
      const bits = Math.min(8, Math.max(0, cidr - i * 8));
      mask.push(256 - Math.pow(2, 8 - bits));
    }

    const network = parts.map((octet, i) => octet & mask[i]);
    const broadcast = network.map((octet, i) => octet | (255 - mask[i]));
    const wildcard = mask.map((m) => 255 - m);

    const firstHost = [...network];
    firstHost[3] += 1;

    const lastHost = [...broadcast];
    lastHost[3] -= 1;

    const hosts = Math.max(0, Math.pow(2, 32 - cidr) - 2);
    const binary = parts.map((o) => o.toString(2).padStart(8, '0')).join('.');

    setSubnetResult({
      subnet: mask.join('.'),
      wildcard: wildcard.join('.'),
      network: network.join('.'),
      broadcast: broadcast.join('.'),
      range: `${firstHost.join('.')} - ${lastHost.join('.')}`,
      hosts,
      binary,
    });
  };

  // ==========================================
  // Unit Converter State & Handlers
  // ==========================================
  const [unitCategory, setUnitCategory] = useState<keyof typeof unitCategories>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('km');
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');

  const performConversion = useCallback(() => {
    const val = parseFloat(fromValue) || 0;
    if (unitCategory === 'temp') {
      let celsius = 0;
      if (fromUnit === 'c') celsius = val;
      else if (fromUnit === 'f') celsius = ((val - 32) * 5) / 9;
      else celsius = val - 273.15;

      let converted = 0;
      if (toUnit === 'c') converted = celsius;
      else if (toUnit === 'f') converted = (celsius * 9) / 5 + 32;
      else converted = celsius + 273.15;

      setToValue(converted.toFixed(4).replace(/\.?0+$/, ''));
      return;
    }

    const catInfo = unitCategories[unitCategory];
    const fromFactor = (catInfo.units as any)[fromUnit]?.value || 1;
    const toFactor = (catInfo.units as any)[toUnit]?.value || 1;

    const result = (val * fromFactor) / toFactor;
    setToValue(result.toPrecision(10).replace(/\.?0+$/, ''));
  }, [unitCategory, fromUnit, toUnit, fromValue]);

  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Keep first option selected when category changes
  useEffect(() => {
    const keys = Object.keys(unitCategories[unitCategory].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  }, [unitCategory]);

  useEffect(() => {
    performConversion();
  }, [fromValue, fromUnit, toUnit, unitCategory, performConversion]);

  // Initial runs
  useEffect(() => {
    calculateLoan();
    calculateSubnet();
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: '80vh', py: 2 }}>
      {/* Header and Language Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t.title}
        </Typography>
        <ToggleButtonGroup
          value={lang}
          exclusive
          onChange={(_, val) => val && setLang(val)}
          size="small"
        >
          <ToggleButton value="en">EN</ToggleButton>
          <ToggleButton value="zh">中文</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label={t.scientificCalc} />
        <Tab label={t.unitConv} />
        <Tab label={t.interestCalc} />
        <Tab label={t.subnetCalc} />
      </Tabs>

      {/* Scientific Calculator Panel */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: '20px', textAlign: 'right', wordBreak: 'break-all' }}>
                {expression || ' '}
              </Typography>
              <Typography variant="h4" sx={{ textAlign: 'right', fontWeight: 'bold', my: 1, wordBreak: 'break-all' }}>
                {calcResult}
              </Typography>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <ToggleButtonGroup
                value={isRadian}
                exclusive
                onChange={(_, val) => val !== null && setIsRadian(val)}
                size="small"
              >
                <ToggleButton value={true}>{t.rad}</ToggleButton>
                <ToggleButton value={false}>{t.deg}</ToggleButton>
              </ToggleButtonGroup>
              <Box>
                <IconButton onClick={handleBackspace} color="primary">
                  <BackspaceIcon />
                </IconButton>
                <IconButton onClick={handleClear} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Grid container spacing={1}>
              {/* Scientific Functions row 1 */}
              {['sin', 'cos', 'tan', 'log', 'ln'].map((f) => (
                <Grid size={{ xs: 2.4 }} key={f}>
                  <Button variant="outlined" fullWidth onClick={() => handleScientificFunc(f)}>
                    {f}
                  </Button>
                </Grid>
              ))}

              {/* Scientific Functions row 2 */}
              {['sqrt', 'pow2', 'pow3', 'factorial', 'percent'].map((f) => (
                <Grid size={{ xs: 2.4 }} key={f}>
                  <Button variant="outlined" fullWidth onClick={() => handleScientificFunc(f)}>
                    {f === 'pow2' ? 'x²' : f === 'pow3' ? 'x³' : f === 'factorial' ? 'x!' : f === 'percent' ? '%' : f}
                  </Button>
                </Grid>
              ))}

              {/* General Numbers and Operators */}
              {[
                { label: '(', val: '(' }, { label: ')', val: ')' }, { label: '^', val: '^' }, { label: 'abs', val: 'abs' }, { label: 'π', val: 'π' },
                { label: '7', val: '7' }, { label: '8', val: '8' }, { label: '9', val: '9' }, { label: '÷', val: '÷' }, { label: 'e', val: 'e' },
                { label: '4', val: '4' }, { label: '5', val: '5' }, { label: '6', val: '6' }, { label: '×', val: '×' }, { label: 'C', action: handleClear },
                { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' }, { label: '−', val: '−' }, { label: '=', action: handleEvaluate },
                { label: '0', val: '0' }, { label: '.', val: '.' }, { label: '+', val: '+' }
              ].map((btn, idx) => {
                // Adjust size layout dynamically
                const isZero = btn.label === '0';
                const colSize = isZero ? 4.8 : 2.4;
                return (
                  <Grid size={{ xs: colSize }} key={idx}>
                    <Button
                      variant="contained"
                      color={btn.action === handleEvaluate ? 'primary' : btn.action === handleClear ? 'error' : 'secondary'}
                      fullWidth
                      sx={{ py: 1.5, fontSize: '1.1rem' }}
                      onClick={() => {
                        if (btn.action) btn.action();
                        else if (btn.val) handleInput(btn.val);
                      }}
                    >
                      {btn.label}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* History log panel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {t.history}
                  </Typography>
                  {calcHistory.length > 0 && (
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setCalcHistory([])}>
                      {t.clearHistory}
                    </Button>
                  )}
                </Box>
                <Divider />
                <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '380px', mt: 1 }}>
                  {calcHistory.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                      {t.noHistory}
                    </Typography>
                  ) : (
                    <List dense>
                      {calcHistory.map((item, index) => (
                        <ListItem key={index} sx={{ borderBottom: '1px solid #f0f0f0', py: 1 }}>
                          <ListItemText>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all', color: '#555' }}>
                              {item.expr}
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all', fontWeight: 'bold', color: '#000' }}>
                              = {item.res}
                            </Typography>
                          </ListItemText>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Unit Converter Panel */}
      {activeTab === 1 && (
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={3} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>{lang === 'en' ? 'Category' : '换算类型'}</InputLabel>
                  <Select
                    value={unitCategory}
                    label={lang === 'en' ? 'Category' : '换算类型'}
                    onChange={(e) => setUnitCategory(e.target.value as any)}
                  >
                    {Object.entries(unitCategories).map(([key, cat]) => (
                      <MenuItem key={key} value={key}>
                        {cat.label[lang]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>{lang === 'en' ? 'From Unit' : '从单位'}</InputLabel>
                    <Select
                      value={fromUnit}
                      label={lang === 'en' ? 'From Unit' : '从单位'}
                      onChange={(e) => setFromUnit(e.target.value)}
                    >
                      {Object.entries(unitCategories[unitCategory].units).map(([key, u]: any) => (
                        <MenuItem key={key} value={key}>
                          {u[lang]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    type="number"
                    label={lang === 'en' ? 'Value' : '数值'}
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    fullWidth
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton onClick={handleSwapUnits} color="primary" size="large">
                  <SwapHorizIcon fontSize="large" />
                </IconButton>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>{lang === 'en' ? 'To Unit' : '到单位'}</InputLabel>
                    <Select
                      value={toUnit}
                      label={lang === 'en' ? 'To Unit' : '到单位'}
                      onChange={(e) => setToUnit(e.target.value)}
                    >
                      {Object.entries(unitCategories[unitCategory].units).map(([key, u]: any) => (
                        <MenuItem key={key} value={key}>
                          {u[lang]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label={t.result}
                    value={toValue}
                    slotProps={{ input: { readOnly: true } }}
                    fullWidth
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Interest Calculator Panel */}
      {activeTab === 2 && (
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label={t.loanAmount}
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t.loanTerm}
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t.annualRate}
                    type="number"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>{t.repaymentMethod}</InputLabel>
                    <Select
                      value={repaymentType}
                      label={t.repaymentMethod}
                      onChange={(e) => setRepaymentType(e.target.value as any)}
                    >
                      <MenuItem value="equal">{t.equalPayment}</MenuItem>
                      <MenuItem value="principal">{t.equalPrincipal}</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="contained" color="primary" onClick={calculateLoan} fullWidth sx={{ py: 1.5 }}>
                    {t.calculate}
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {interestResult && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {t.result}
                    </Typography>
                    <Divider />
                    {repaymentType === 'equal' ? (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography color="text.secondary">{t.monthlyPayment}</Typography>
                        <Typography sx={{ fontWeight: 'bold' }}>¥ {interestResult.monthlyPay}</Typography>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography color="text.secondary">{t.firstMonthPayment}</Typography>
                          <Typography sx={{ fontWeight: 'bold' }}>¥ {interestResult.firstMonthPay}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography color="text.secondary">{t.lastMonthPayment}</Typography>
                          <Typography sx={{ fontWeight: 'bold' }}>¥ {interestResult.lastMonthPay}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography color="text.secondary">{t.monthlyDecrease}</Typography>
                          <Typography sx={{ fontWeight: 'bold' }}>¥ {interestResult.monthlyDecrease}</Typography>
                        </Box>
                      </>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography color="text.secondary">{t.totalPayment}</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>¥ {interestResult.totalPay}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography color="text.secondary">{t.totalInterest}</Typography>
                      <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>¥ {interestResult.totalInterest}</Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Subnet Calculator Panel */}
      {activeTab === 3 && (
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label={t.ipAddress}
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label={t.cidrLabel}
                    type="number"
                    value={cidr}
                    onChange={(e) => setCidr(Math.min(32, Math.max(0, parseInt(e.target.value) || 0)))}
                    fullWidth
                  />
                  <Button variant="contained" color="primary" onClick={calculateSubnet} fullWidth sx={{ py: 1.5 }}>
                    {t.calculate}
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                {subnetResult && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {t.result}
                    </Typography>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">{t.subnetMask}</Typography>
                      <Typography sx={{ fontFamily: 'monospace' }}>{subnetResult.subnet}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">{t.wildcardMask}</Typography>
                      <Typography sx={{ fontFamily: 'monospace' }}>{subnetResult.wildcard}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">{t.networkAddress}</Typography>
                      <Typography sx={{ fontFamily: 'monospace' }}>{subnetResult.network}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">{t.broadcastAddress}</Typography>
                      <Typography sx={{ fontFamily: 'monospace' }}>{subnetResult.broadcast}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">{t.hostRange}</Typography>
                      <Typography sx={{ fontFamily: 'monospace' }}>{subnetResult.range}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">{t.hostCount}</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>{subnetResult.hosts.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Typography color="text.secondary">{t.ipBinary}</Typography>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{subnetResult.binary}</Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
