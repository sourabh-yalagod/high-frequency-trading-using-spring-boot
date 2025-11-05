export const TOP_ASSETS = [
  { symbol: "BTCUSDT", name: "Bitcoin", icon: "https://assets.coincap.io/assets/icons/btc@2x.png" },
  { symbol: "ETHUSDT", name: "Ethereum", icon: "https://assets.coincap.io/assets/icons/eth@2x.png" },
  { symbol: "BNBUSDT", name: "BNB", icon: "https://assets.coincap.io/assets/icons/bnb@2x.png" },
  { symbol: "XRPUSDT", name: "XRP", icon: "https://assets.coincap.io/assets/icons/xrp@2x.png" },
  { symbol: "ADAUSDT", name: "Cardano", icon: "https://assets.coincap.io/assets/icons/ada@2x.png" },
  { symbol: "SOLUSDT", name: "Solana", icon: "https://assets.coincap.io/assets/icons/sol@2x.png" },
  { symbol: "DOGEUSDT", name: "Dogecoin", icon: "https://assets.coincap.io/assets/icons/doge@2x.png" },
  { symbol: "DOTUSDT", name: "Polkadot", icon: "https://assets.coincap.io/assets/icons/dot@2x.png" },
  { symbol: "MATICUSDT", name: "Polygon", icon: "https://assets.coincap.io/assets/icons/matic@2x.png" },
  { symbol: "LTCUSDT", name: "Litecoin", icon: "https://assets.coincap.io/assets/icons/ltc@2x.png" },
  { symbol: "TRXUSDT", name: "TRON", icon: "https://assets.coincap.io/assets/icons/trx@2x.png" },
  { symbol: "SHIBUSDT", name: "Shiba Inu", icon: "https://assets.coincap.io/assets/icons/shib@2x.png" },
  { symbol: "AVAXUSDT", name: "Avalanche", icon: "https://assets.coincap.io/assets/icons/avax@2x.png" },
  { symbol: "LINKUSDT", name: "Chainlink", icon: "https://assets.coincap.io/assets/icons/link@2x.png" },
  { symbol: "BCHUSDT", name: "Bitcoin Cash", icon: "https://assets.coincap.io/assets/icons/bch@2x.png" },
];

export const dummyBids = [
  { price: 49850.25, quantity: 0.25 },
  { price: 49860.0, quantity: 0.3 },
  { price: 49870.5, quantity: 0.45 },
];

export const dummyAsks = [
  { price: 49900.0, quantity: 0.4 },
  { price: 49910.75, quantity: 0.5 },
  { price: 49920.0, quantity: 0.6 },
];

export const order = {
  type: {
    limit: "LIMIT",
    market: "MARKET"
  },
  side: {
    buy: "BUY",
    sell: "SELL"
  },
  status: {
    pending: "PENDING",
    open: "OPEN",
    closed: "CLOSED",
    rejected: "REJECTED"
  }
}

const isDark = true;

export const options: any = {
  chart: {
    id: 'crypto-price-chart',
    type: 'area',
    height: 350,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
      autoSelected: 'zoom',
    },
    zoom: {
      enabled: true,
      autoScaleYaxis: true,
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
    background: 'transparent',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },

  stroke: {
    curve: 'smooth',
    width: 2.5,
    colors: [isDark ? '#3B82F6' : '#2563EB'],
    lineCap: 'round',
  },

  markers: {
    size: 0,
    colors: [isDark ? '#3B82F6' : '#2563EB'],
    strokeColors: isDark ? '#1F2937' : '#FFFFFF',
    strokeWidth: 2,
    hover: {
      size: 7,
      sizeOffset: 3,
    },
  },

  fill: {
    type: 'gradient',
    gradient: {
      shade: isDark ? 'dark' : 'light',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: [isDark ? '#1E3A8A' : '#DBEAFE'],
      inverseColors: false,
      opacityFrom: isDark ? 0.6 : 0.5,
      opacityTo: isDark ? 0.05 : 0.1,
      stops: [0, 90, 100],
    },
  },

  grid: {
    show: true,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    strokeDashArray: 3,
    position: 'back',
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
    padding: {
      top: 0,
      right: 20,
      bottom: 0,
      left: 10,
    },
  },

  dataLabels: {
    enabled: false,
  },

  xaxis: {
    type: 'datetime',
    labels: {
      style: {
        colors: isDark ? '#9CA3AF' : '#6B7280',
        fontSize: '12px',
        fontWeight: 500,
      },
      datetimeUTC: false,
      datetimeFormatter: {
        year: 'yyyy',
        month: "MMM 'yy",
        day: 'dd MMM',
        hour: 'HH:mm',
      },
    },
    axisBorder: {
      show: true,
      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      height: 1,
    },
    axisTicks: {
      show: true,
      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      height: 6,
    },
    crosshairs: {
      show: true,
      stroke: {
        color: isDark ? '#4B5563' : '#D1D5DB',
        width: 1,
        dashArray: 3,
      },
    },
  },

  yaxis: {
    opposite: false, // This puts Y-axis on the LEFT
    tickAmount: 6,
    labels: {
      style: {
        colors: isDark ? '#9CA3AF' : '#6B7280',
        fontSize: '12px',
        fontWeight: 600,
      },
      formatter: (value: number) => {
        if (value >= 1000) {
          return `$${(value / 1000).toFixed(2)}K`;
        }
        return `$${value.toFixed(2)}`;
      },
      offsetX: -10,
    },
    axisBorder: {
      show: true,
      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    axisTicks: {
      show: true,
      color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
  },

  tooltip: {
    enabled: true,
    theme: isDark ? 'dark' : 'light',
    shared: true,
    intersect: false,
    style: {
      fontSize: '13px',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    x: {
      format: 'dd MMM yyyy HH:mm',
    },
    y: {
      formatter: (value: number) => {
        return `$${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
    marker: {
      show: true,
    },
    custom: undefined,
  },

  legend: {
    show: false,
  },

  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 320,
        },
        grid: {
          padding: {
            right: 10,
            left: 5,
          },
        },
      },
    },
    {
      breakpoint: 768,
      options: {
        chart: {
          height: 280,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: 2,
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '11px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '11px',
            },
            offsetX: -5,
          },
        },
        grid: {
          padding: {
            right: 5,
            left: 0,
          },
        },
      },
    },
    {
      breakpoint: 480,
      options: {
        chart: {
          height: 240,
        },
        stroke: {
          width: 1.5,
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '10px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '10px',
            },
            offsetX: 0,
            formatter: (value: number) => {
              if (value >= 1000) {
                return `$${(value / 1000).toFixed(1)}K`;
              }
              return `$${value.toFixed(0)}`;
            },
          },
        },
      },
    },
  ],
};

export const qnaData = [
  {
    id: 1,
    question: "What is CryptoX Exchange?",
    answer: "CryptoX is a comprehensive cryptocurrency exchange platform that allows you to trade, invest, and manage your digital assets securely. We offer a wide range of cryptocurrencies, advanced trading tools, and industry-leading security measures."
  },
  {
    id: 2,
    question: "How do I get started with trading?",
    answer: "Getting started is easy! Simply sign up for an account, complete the verification process, deposit funds into your wallet, and you're ready to start trading. We offer guides and tutorials for beginners to help you navigate the platform."
  },
  {
    id: 3,
    question: "Is my money safe on CryptoX?",
    answer: "Yes, security is our top priority. We use bank-level encryption, two-factor authentication, cold storage for the majority of funds, and regular security audits to ensure your assets are protected at all times."
  },
  {
    id: 4,
    question: "What are the trading fees?",
    answer: "Our trading fees are competitive and transparent. Maker fees start at 0.1% and taker fees at 0.15%. Volume-based discounts are available for high-frequency traders. Deposit fees vary by payment method, and withdrawal fees depend on the cryptocurrency."
  },
  {
    id: 5,
    question: "Can I use CryptoX on mobile?",
    answer: "Absolutely! CryptoX is available on iOS and Android devices. Our mobile app offers the same features as the desktop version, allowing you to trade, monitor markets, and manage your portfolio on the go."
  }
];

export const dummyOrders = [
  {
    id: "1",
    userId: "u1",
    asset: "BTCUSDT",
    orderType: "LIMIT",
    price: 67000,
    quantity: 0.02,
    remainingQuantity: 0.02,
    margin: "isolated",
    sl:10,
    tg:100,
    status: "PENDING",
    orderSide: "BUY",
    createdAt: "2025-11-01T10:12:00Z",
    updateAt: "2025-11-01T10:12:00Z",
  }
];


