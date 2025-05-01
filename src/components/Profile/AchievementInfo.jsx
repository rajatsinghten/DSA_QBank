import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";

function AchievementInfo({ formRef, onSuccess }) {
    const { id } = useParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const API_BASE_URL = "http://localhost:3000/api/v1";

    const form = useForm({
        defaultValues: {
            achievements: [{
                title: "",
                description: "",
                date: "",
                issuer: ""
            }]
        }
    });

    useEffect(() => {
        const fetchAchievements = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${id}/getprofile`);
                const profileData = response.data;
                
                if (profileData.achievements && profileData.achievements.length > 0) {
                    setIsSubmitted(true);
                    // Format dates for input fields
                    const formattedAchievements = profileData.achievements.map(achievement => ({
                        ...achievement,
                        date: achievement.date?.split('T')[0] || ""
                    }));
                    form.reset({ achievements: formattedAchievements });
                }
            } catch (error) {
                console.error('Error fetching achievements:', error);
                setFetchError(error.response?.data?.error || 'Failed to fetch achievements');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchAchievements();
    }, [id, form]);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${id}/achievements`, {
                achievements: data.achievements
            });
            
            if (response.status === 200) {
                setIsSubmitted(true);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update achievements';
            form.setError('root', { type: 'manual', message: errorMessage });
        }
    };

    const addAchievement = () => {
        const currentAchievements = form.getValues("achievements");
        form.setValue("achievements", [
            ...currentAchievements,
            { title: "", description: "", date: "", issuer: "" }
        ]);
    };

    const removeAchievement = (index) => {
        const currentAchievements = form.getValues("achievements");
        const updatedAchievements = currentAchievements.filter((_, i) => i !== index);
        form.setValue("achievements", updatedAchievements);
    };

    if (isLoading) {
        return (
            <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </Card>
        );
    }

    if (fetchError) {
        return (
            <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
                <div className="text-red-500">{fetchError}</div>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Card>
        );
    }

    const currentAchievements = form.watch("achievements") || [];

    return (
        <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
            {isSubmitted ? (
                <div className="space-y-4 text-lg">
                    <h2 className="text-xl font-semibold">Achievements</h2>
                    {currentAchievements.map((achievement, index) => (
                        <div key={index} className="border p-3 rounded-lg">
                            <p><strong>Title:</strong> {achievement.title}</p>
                            <p><strong>Description:</strong> {achievement.description}</p>
                            <p><strong>Date:</strong> {achievement.date}</p>
                            <p><strong>Issuer:</strong> {achievement.issuer || 'Not specified'}</p>
                        </div>
                    ))}
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
                </div>
            ) : (
                <Form {...form}>
                    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {currentAchievements.map((_, index) => (
                            <div key={index} className="border p-4 rounded-lg space-y-3 relative">
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                                    onClick={() => removeAchievement(index)}
                                    disabled={currentAchievements.length <= 1}
                                >
                                    <X size={20} />
                                </button>
                                <h3 className="text-lg font-semibold">Achievement {index + 1}</h3>

                                {["title", "date", "issuer"].map((fieldName) => (
                                    <FormField
                                        key={fieldName}
                                        control={form.control}
                                        name={`achievements.${index}.${fieldName}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {fieldName.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        type={fieldName === "date" ? "date" : "text"} 
                                                        required={fieldName !== "issuer"}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <FormField
                                    control={form.control}
                                    name={`achievements.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}

                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={addAchievement}>
                                Add Another Achievement
                            </Button>
                            <Button type="submit">Save Achievements</Button>
                        </div>

                        {form.formState.errors.root && (
                            <p className="text-red-500">{form.formState.errors.root.message}</p>
                        )}
                    </form>
                </Form>
            )}
        </Card>
    );
}

export default AchievementInfo;