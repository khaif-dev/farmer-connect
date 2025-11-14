// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white sm:py-24 text-center">
        <div className=" px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Climate-Smart Farming, Fair Market Prices
          </h1>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Get free weather intelligence for better harvests and connect directly with buyers for better income.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                variant="outline"
                className="text-green-800 dark:text-green-200 bg-white dark:bg-gray-800 hover:bg-transparent hover:border-white dark:hover:border-gray-300 hover:text-white dark:hover:text-gray-100 transition-all duration-200"
              >
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-green-800 dark:text-green-200 bg-white dark:bg-gray-800 hover:bg-transparent hover:border-white dark:hover:border-gray-300 hover:text-white dark:hover:text-gray-100 transition-all duration-200"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Why Farmer Connect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: 'fas fa-cloud-sun',
                title: 'Smart Weather Alerts',
                description: 'Get hyperlocal weather forecasts tailored to your farm.'
              },
              {
                icon: 'fas fa-robot',
                title: 'AI Crop Advice',
                description: 'Intelligent recommendations for planting and harvesting.'
              },
              {
                icon: 'fas fa-shopping-cart',
                title: 'Direct Market Access',
                description: 'Connect directly with schools, restaurants, and buyers.'
              },
              {
                icon: 'fas fa-chart-line',
                title: 'Income Growth',
                description: 'Increase profits by 50%+ through better pricing.'
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className={`${feature.icon} text-green-600 dark:text-green-400 text-2xl`}></i>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;