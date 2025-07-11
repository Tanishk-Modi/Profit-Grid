import React from 'react';

interface CompanyProfileProps {
  companyProfile: any;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ companyProfile }) => {
  if (!companyProfile) return null;

  return (
    <div className="w-full text-left bg-gray-900 bg-opacity-70 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 mt-8 animate-fade-in-up">
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-4">
        Company Profile
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-lg">
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Company Name</span>
          <span className="text-gray-200 text-xl">{companyProfile.company_name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Exchange</span>
          <span className="text-gray-200 text-xl">{companyProfile.exchange}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Industry</span>
          <span className="text-gray-200 text-xl">{companyProfile.industry}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Sector</span>
          <span className="text-gray-200 text-xl">{companyProfile.sector}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">CEO</span>
          <span className="text-gray-200 text-xl">{companyProfile.ceo}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Website</span>
          <a href={companyProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xl">{companyProfile.website}</a>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Full Time Employees</span>
          <span className="text-gray-200 text-xl">{companyProfile.full_time_employees?.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Country</span>
          <span className="text-gray-200 text-xl">{companyProfile.country}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">IPO Date</span>
          <span className="text-gray-200 text-xl">{companyProfile.ipo_date}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold text-base">Market Cap</span>
          <span className="text-gray-200 text-xl">${parseFloat(companyProfile.market_cap).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
