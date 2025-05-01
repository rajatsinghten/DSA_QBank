import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Loader2 } from "lucide-react";

function WorkInfo({ formRef, onSuccess }) {
    const { id } = useParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const API_BASE_URL = "http://localhost:3000/api/v1";

    const form = useForm({
        defaultValues: {
            workExperience: [{
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                description: "",
                isCurrent: false,
            }]
        }
    });

    useEffect(() => {
        const fetchWorkExperience = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${id}/getprofile`);
                const profileData = response.data;
                
                if (profileData.workEx && profileData.workEx.length > 0) {
                    setIsSubmitted(true);
                    // Format dates for input fields
                    const formattedWorkEx = profileData.workEx.map(exp => ({
                        ...exp,
                        startDate: exp.startDate?.split('T')[0] || "",
                        endDate: exp.isCurrent ? "" : (exp.endDate?.split('T')[0] || "")
                    }));
                    form.reset({ workExperience: formattedWorkEx });
                }
            } catch (error) {
                console.error('Error fetching work experience:', error);
                setFetchError(error.response?.data?.error || 'Failed to fetch work experience');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchWorkExperience();
    }, [id, form]);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${id}/work-experience`, {
                workExperience: data.workExperience
            });
            
            if (response.status === 200) {
                setIsSubmitted(true);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update work experience';
            form.setError('root', { type: 'manual', message: errorMessage });
        }
    };

    const addWorkExperience = () => {
        const currentWork = form.getValues("workExperience");
        form.setValue("workExperience", [
            ...currentWork,
            { company: "", position: "", startDate: "", endDate: "", description: "", isCurrent: false }
        ]);
    };

    const removeWorkExperience = (index) => {
        const currentWork = form.getValues("workExperience");
        const updatedWork = currentWork.filter((_, i) => i !== index);
        form.setValue("workExperience", updatedWork);
    };

    const handleCheckboxChange = (index, checked) => {
        form.setValue(`workExperience.${index}.isCurrent`, checked);
        if (checked) {
            form.setValue(`workExperience.${index}.endDate`, "");
        }
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

    const currentWork = form.watch("workExperience") || [];

    return (
        <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
            {isSubmitted ? (
                <div className="space-y-4 text-lg">
                    <h2 className="text-xl font-semibold">Work Experience</h2>
                    {currentWork.map((work, index) => (
                        <div key={index} className="border p-3 rounded-lg relative">
                            <p><strong>Company:</strong> {work.company}</p>
                            <p><strong>Position:</strong> {work.position}</p>
                            <p><strong>Start Date:</strong> {work.startDate}</p>
                            {!work.isCurrent && <p><strong>End Date:</strong> {work.endDate}</p>}
                            <p><strong>Description:</strong> {work.description}</p>
                            <p><strong>Currently Working:</strong> {work.isCurrent ? "Yes" : "No"}</p>
                        </div>
                    ))}
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
                </div>
            ) : (
                <Form {...form}>
                    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {currentWork.map((work, index) => (
                            <div key={index} className="border p-4 rounded-lg space-y-3 relative">
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                                    onClick={() => removeWorkExperience(index)}
                                    disabled={currentWork.length <= 1}
                                >
                                    <X size={20} />
                                </button>

                                <h3 className="text-lg font-semibold">Experience {index + 1}</h3>
                                
                                {["company", "position", "startDate"].map((fieldName) => (
                                    <FormField
                                        key={fieldName}
                                        control={form.control}
                                        name={`workExperience.${index}.${fieldName}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {fieldName.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        type={fieldName.includes("Date") ? "date" : "text"} 
                                                        required 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <FormField
                                    control={form.control}
                                    name={`workExperience.${index}.description`}
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

                                {!form.watch(`workExperience.${index}.isCurrent`) && (
                                    <FormField
                                        control={form.control}
                                        name={`workExperience.${index}.endDate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="date" required={!form.watch(`workExperience.${index}.isCurrent`)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name={`workExperience.${index}.isCurrent`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => handleCheckboxChange(index, checked)}
                                                />
                                            </FormControl>
                                            <FormLabel>Currently Working Here</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}

                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={addWorkExperience}>
                                Add Another Experience
                            </Button>
                            <Button type="submit">Save Work Experience</Button>
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

export default WorkInfo;