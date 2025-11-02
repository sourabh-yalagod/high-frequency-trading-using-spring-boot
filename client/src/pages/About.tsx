import { TrendingUp, Shield, Zap, Users, Globe, Award, CheckCircle, Target } from 'lucide-react';

const About = () => {
  const stats = [
    { value: '10M+', label: 'Active Users', icon: Users },
    { value: '$50B+', label: 'Trading Volume', icon: TrendingUp },
    { value: '150+', label: 'Countries', icon: Globe },
    { value: '99.9%', label: 'Uptime', icon: Shield },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your assets are protected with multi-layer security protocols, cold storage, and insurance coverage.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Execute trades in milliseconds with our high-performance matching engine and global infrastructure.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to assist you with any questions or issues.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Award,
      title: 'Industry Leader',
      description: 'Recognized globally for excellence in crypto trading, innovation, and customer satisfaction.',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const values = [
    { icon: CheckCircle, title: 'Trust', description: 'Building lasting relationships through transparency and reliability' },
    { icon: Target, title: 'Innovation', description: 'Pioneering the future of digital asset trading' },
    { icon: Shield, title: 'Security', description: 'Protecting your investments with cutting-edge technology' },
    { icon: Users, title: 'Community', description: 'Empowering millions to participate in the crypto economy' },
  ];

  const timeline = [
    { year: '2018', title: 'Foundation', description: 'Crypto Hub was founded with a vision to democratize access to digital assets' },
    { year: '2019', title: 'Global Expansion', description: 'Launched operations in 50+ countries with multi-currency support' },
    { year: '2021', title: '5M Users', description: 'Reached 5 million users milestone and $10B in trading volume' },
    { year: '2023', title: 'Industry Leader', description: 'Became one of the top 10 crypto exchanges globally' },
    { year: '2024', title: 'Innovation Hub', description: 'Launched advanced trading features and DeFi integration' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-8">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">Leading Crypto Exchange</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Crypto Hub
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Your trusted gateway to the future of finance. We're building the most secure, 
              reliable, and user-friendly platform for trading digital assets.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all hover:scale-105"
                >
                  <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Founded in 2018, Crypto Hub emerged from a simple vision: to make cryptocurrency 
                  trading accessible, secure, and rewarding for everyone. What started as a small 
                  team of passionate blockchain enthusiasts has grown into a global platform serving 
                  millions of users worldwide.
                </p>
                <p>
                  We believe that digital assets represent the future of finance, and our mission 
                  is to empower individuals and institutions to participate in this revolutionary 
                  ecosystem. Through continuous innovation and unwavering commitment to security, 
                  we've built a platform that traders trust.
                </p>
                <p>
                  Today, Crypto Hub processes billions in trading volume daily, supports over 500 
                  cryptocurrencies, and operates in more than 150 countries. But our journey is 
                  just beginning.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-2xl font-bold text-white mb-4">Mission Statement</h3>
                  <p className="text-gray-300 leading-relaxed">
                    "To democratize access to digital assets and empower the next generation of 
                    investors through cutting-edge technology, uncompromising security, and 
                    exceptional user experience."
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Crypto Hub?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We combine cutting-edge technology with user-centric design to deliver 
              the ultimate trading experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all group hover:scale-105"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-400 text-lg">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 text-center hover:border-blue-500/50 transition-all"
              >
                <div className="inline-flex p-4 rounded-full bg-blue-500/20 mb-4">
                  <value.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our Journey
            </h2>
            <p className="text-gray-400 text-lg">
              Milestones that shaped Crypto Hub
            </p>
          </div>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div 
                key={index}
                className="flex flex-col sm:flex-row gap-6 items-start group"
              >
                <div className="flex-shrink-0 w-24 sm:w-32">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                    {item.year}
                  </div>
                </div>
                <div className="flex-1 bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 group-hover:border-blue-500/50 transition-all">
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Join millions of users who trust Crypto Hub for their digital asset trading needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg">
                  Get Started Now
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all hover:scale-105">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;