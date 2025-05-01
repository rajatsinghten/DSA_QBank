import React from 'react';
import { Card, CardDescription, CardTitle } from "../ui/card";
import { FileUser, LayoutTemplate, ShieldQuestion } from "lucide-react";
import feature from '../../assets/feature.svg';

const features = [
    {
        icon: <FileUser className="text-green-500" size={40} />,
        title: "Dynamic Resume and Cover Letter Creation",
        description: "Automatically generate tailored resumes and cover letters for any job by analyzing your profile and the job description.",
    },
    {
        icon: <LayoutTemplate className="text-green-500" size={40} />,
        title: "Automated Portfolio Management",
        description: "Seamlessly manage and update your portfolio in real time with an API, ensuring it stays relevant and up-to-date without manual effort.",
    },
    {
        icon: <ShieldQuestion className="text-green-500" size={40} />,
        title: "Curated Interview Preparation",
        description: "Access job-specific DSA and interview questions curated using AI and real-world insights to help you prepare efficiently.",
    },
];

const Features = () => {
    return (
        <div className="w-full flex flex-col lg:flex-row items-end gap-6 px-4 md:px-8 py-10 md:py-20" id='services'>
            {/* Text Section */}
            <div className="w-full lg:w-1/2 flex flex-col items-start">
                <h2 className="text-3xl md:text-5xl font-bold py-2"> <span className='text-green-500'>Client-Centric </span> Services</h2>
                <p className="text-sm md:text-lg mt-2">Tailored resumes, automated portfolio updates, and AI-curated interview questions — all in one platform!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 mt-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="p-4 rounded-lg shadow-md flex dark:bg-gray-800">
                            <div className='w-1/5 flex justify-center items-center'>
                                {feature.icon}
                            </div>
                            <div className='w-4/5 flex flex-col justify-center items-start'>
                                <CardTitle className="text-lg md:text-xl font-semibold py-1">{feature.title}</CardTitle>
                                <CardDescription className='text-xs md:text-sm py-1'>{feature.description}</CardDescription>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Image Section */}
            <div className="w-full lg:w-1/2 flex justify-center items-end mt-6 lg:mt-0">
                <img src={feature} alt="Illustration" className="w-3/4 h-auto max-w-md" />
            </div>
        </div>
    );
};

export default Features;
