import React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "../ui/card";
import CTAImg from "../../assets/CTA.svg";

const CTA = () => {
    return (
        <Card className="mx-8 p-6 rounded-lg shadow-lg flex flex-col md:flex-row-reverse md:items-center space-y-6 md:space-y-0 md:space-x-6" id="about">
            {/* Content Section */}
            <div className="w-full md:w-3/4 space-y-4">
                {/* Heading */}
                    <CardTitle className="text-3xl font-bold text-center md:text-left">
                        <span className="text-green-500">About</span> Company
                    </CardTitle>

                {/* Description */}
                <CardDescription className="text-center pb-5 md:text-left">
                    Uply is an AI-powered career tool designed to streamline your job
                    application process. It offers dynamic resume creation and cover
                    letter generation tailored to specific job descriptions, automated
                    portfolio management with real-time updates, and curated practice
                    questions for interviews. With Uply, you can save time, stay prepared,
                    and effortlessly showcase your best self for every opportunity.
                </CardDescription>

                {/* Stats Section */}
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                        <div>
                            <h3 className="text-2xl font-bold">2.7K+</h3>
                            <p className="text-gray-400">Hits</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">1.8K+</h3>
                            <p className="text-gray-400">Active Users</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">4</h3>
                            <p className="text-gray-400">Services</p>
                        </div>
                    </div>
                </CardContent>
            </div>

            {/* Image Section */}
            <div className="w-full md:w-1/4 flex justify-center items-center">
                <img
                    src={CTAImg} // Replace with the actual image URL
                    alt="Profile"
                    className="w-4/5 h-auto"
                />
            </div>
        </Card>
    );
};

export default CTA;