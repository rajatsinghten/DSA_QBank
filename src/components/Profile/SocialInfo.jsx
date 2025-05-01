import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Globe, Linkedin, Github, Twitter, MessagesSquare, Code, User, Loader2 } from "lucide-react";

const socialPlatforms = {
    linkedIn: { label: "LinkedIn", icon: <Linkedin className="w-5 h-5 text-blue-600" /> },
    github: { label: "GitHub", icon: <Github className="w-5 h-5 text-gray-700" /> },
    twitter: { label: "Twitter", icon: <Twitter className="w-5 h-5 text-blue-500" /> },
    website: { label: "Website", icon: <Globe className="w-5 h-5 text-green-600" /> },
    medium: { label: "Medium", icon: <MessagesSquare className="w-5 h-5 text-black" /> },
    stackOverflow: { label: "Stack Overflow", icon: <Code className="w-5 h-5 text-orange-500" /> },
    leetcode: { label: "LeetCode", icon: <Code className="w-5 h-5 text-yellow-600" /> },
};

function SocialInfo({ formRef, onSuccess }) {
    const { id } = useParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const API_BASE_URL = "http://localhost:3000/api/v1";

    const form = useForm({
        defaultValues: {
            socials: {
                linkedIn: "",
                github: "",
                twitter: "",
                website: "",
                medium: "",
                stackOverflow: "",
                leetcode: "",
            }
        }
    });

    useEffect(() => {
        const fetchSocials = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${id}/getprofile`);
                const profileData = response.data;
                
                if (profileData.socials) {
                    setIsSubmitted(true);
                    // Initialize with default values and merge with fetched data
                    const defaultSocials = {
                        linkedIn: "",
                        github: "",
                        twitter: "",
                        website: "",
                        medium: "",
                        stackOverflow: "",
                        leetcode: "",
                    };
                    form.reset({ 
                        socials: { ...defaultSocials, ...profileData.socials } 
                    });
                }
            } catch (error) {
                console.error('Error fetching social links:', error);
                setFetchError(error.response?.data?.error || 'Failed to fetch social links');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchSocials();
    }, [id, form]);

    const onSubmit = async (data) => {
        try {
            // Filter out empty values before submitting
            const socialsToSubmit = Object.fromEntries(
                Object.entries(data.socials).filter(([_, value]) => value.trim() !== "")
            );

            const response = await axios.post(`${API_BASE_URL}/${id}/socials`, {
                socials: socialsToSubmit
            });
            
            if (response.status === 200) {
                setIsSubmitted(true);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update social links';
            form.setError('root', { type: 'manual', message: errorMessage });
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6 w-full max-w-3xl bg-background border-none shadow-none flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </Card>
        );
    }

    if (fetchError) {
        return (
            <Card className="p-6 w-full max-w-3xl bg-background border-none shadow-none">
                <div className="text-red-500">{fetchError}</div>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Card>
        );
    }

    const currentSocials = form.watch("socials") || {};

    return (
        <Card className="p-6 w-full max-w-3xl bg-background border-none shadow-none">
            {isSubmitted ? (
                <div className="space-y-4 text-lg">
                    <h2 className="text-xl font-semibold">Social Links</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(currentSocials)
                            .filter(([_, value]) => value.trim() !== "")
                            .map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    {socialPlatforms[key]?.icon || <User className="w-5 h-5 text-gray-500" />}
                                    <a 
                                        href={value.startsWith('http') ? value : `https://${value}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-blue-500 hover:underline truncate"
                                    >
                                        {socialPlatforms[key]?.label || key}
                                    </a>
                                </div>
                            ))
                        }
                    </div>
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
                </div>
            ) : (
                <Form {...form}>
                    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(socialPlatforms).map(([key, { label, icon }]) => (
                                <FormField
                                    key={key}
                                    control={form.control}
                                    name={`socials.${key}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center space-x-2">
                                                {icon}
                                                <span>{label}</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    type="url" 
                                                    placeholder={`https://${key === 'website' ? 'yourwebsite.com' : `${key}.com/username`}`} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                {form.formState.errors.root && (
                                    <p className="text-red-500">{form.formState.errors.root.message}</p>
                                )}
                            </div>
                            <Button type="submit">Save Social Links</Button>
                        </div>
                    </form>
                </Form>
            )}
        </Card>
    );
}

export default SocialInfo;