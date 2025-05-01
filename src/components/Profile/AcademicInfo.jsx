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

function AcademicInfo({ formRef, onSuccess }) {
    const { id } = useParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const API_BASE_URL = "http://localhost:3000/api/v1";

    const form = useForm({
        defaultValues: {
            academics: [{
                institution: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                description: "",
                grade: "",
            }]
        },
    });

    useEffect(() => {
        const fetchAcademicInfo = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${id}/getprofile`);
                const profileData = response.data;
                
                if (profileData.academic && profileData.academic.length > 0) {
                    setIsSubmitted(true);
                    // Format dates for input fields
                    const formattedAcademics = profileData.academic.map(entry => ({
                        ...entry,
                        startDate: entry.startDate?.split('T')[0] || "",
                        endDate: entry.endDate?.split('T')[0] || ""
                    }));
                    form.reset({ academics: formattedAcademics });
                }
            } catch (error) {
                console.error('Error fetching academic info:', error);
                setFetchError(error.response?.data?.error || 'Failed to fetch academic information');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchAcademicInfo();
    }, [id, form]);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${id}/academics`, {
                academics: data.academics
            });
            
            if (response.status === 200) {
                setIsSubmitted(true);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update academic information';
            form.setError('root', { type: 'manual', message: errorMessage });
        }
    };

    const addEntry = () => {
        const currentAcademics = form.getValues("academics");
        form.setValue("academics", [
            ...currentAcademics,
            {
                institution: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                description: "",
                grade: "",
            }
        ]);
    };

    const removeEntry = (index) => {
        const currentAcademics = form.getValues("academics");
        const updatedAcademics = currentAcademics.filter((_, i) => i !== index);
        form.setValue("academics", updatedAcademics);
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

    const currentAcademics = form.watch("academics") || [];

    return (
        <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
            {isSubmitted ? (
                <div className="space-y-4 text-lg">
                    <h2 className="text-xl font-semibold">Academic Information</h2>
                    {currentAcademics.map((entry, index) => (
                        <div key={index} className="border p-3 rounded-lg relative">
                            <p><strong>Institution:</strong> {entry.institution}</p>
                            <p><strong>Degree:</strong> {entry.degree}</p>
                            <p><strong>Field of Study:</strong> {entry.fieldOfStudy}</p>
                            <p><strong>Start Date:</strong> {entry.startDate}</p>
                            <p><strong>End Date:</strong> {entry.endDate || 'Present'}</p>
                            <p><strong>Grade:</strong> {entry.grade}</p>
                            <p><strong>Description:</strong> {entry.description}</p>
                        </div>
                    ))}
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
                </div>
            ) : (
                <Form {...form}>
                    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {currentAcademics.map((_, index) => (
                            <div key={index} className="border p-4 rounded-lg space-y-3 relative">
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                                    onClick={() => removeEntry(index)}
                                    disabled={currentAcademics.length <= 1}
                                >
                                    <X size={20} />
                                </button>

                                <h3 className="text-lg font-semibold">Entry {index + 1}</h3>

                                {["institution", "degree", "fieldOfStudy", "startDate", "endDate", "grade"].map((fieldName) => (
                                    <FormField
                                        key={fieldName}
                                        control={form.control}
                                        name={`academics.${index}.${fieldName}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {fieldName.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        type={fieldName.includes("Date") ? "date" : "text"} 
                                                        required={fieldName !== "endDate" && fieldName !== "grade"}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <FormField
                                    control={form.control}
                                    name={`academics.${index}.description`}
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
                            <Button type="button" variant="outline" onClick={addEntry}>
                                Add Another Entry
                            </Button>
                            <Button type="submit">Save Academic Information</Button>
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

export default AcademicInfo;