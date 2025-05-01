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

function PublicationInfo({ formRef, onSuccess }) {
    const { id } = useParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const API_BASE_URL = "http://localhost:3000/api/v1";

    const form = useForm({
        defaultValues: {
            publications: [{
                title: "",
                publisher: "",
                publicationDate: "",
                description: "",
                link: ""
            }]
        }
    });

    useEffect(() => {
        const fetchPublications = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${id}/getprofile`);
                const profileData = response.data;
                
                if (profileData.publications && profileData.publications.length > 0) {
                    setIsSubmitted(true);
                    // Format dates for input fields
                    const formattedPublications = profileData.publications.map(pub => ({
                        ...pub,
                        publicationDate: pub.publicationDate?.split('T')[0] || ""
                    }));
                    form.reset({ publications: formattedPublications });
                }
            } catch (error) {
                console.error('Error fetching publications:', error);
                setFetchError(error.response?.data?.error || 'Failed to fetch publications');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchPublications();
    }, [id, form]);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${id}/publications`, {
                publications: data.publications
            });
            
            if (response.status === 200) {
                setIsSubmitted(true);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update publications';
            form.setError('root', { type: 'manual', message: errorMessage });
        }
    };

    const addPublication = () => {
        const currentPublications = form.getValues("publications");
        form.setValue("publications", [
            ...currentPublications,
            { title: "", publisher: "", publicationDate: "", description: "", link: "" }
        ]);
    };

    const removePublication = (index) => {
        const currentPublications = form.getValues("publications");
        const updatedPublications = currentPublications.filter((_, i) => i !== index);
        form.setValue("publications", updatedPublications);
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

    const currentPublications = form.watch("publications") || [];

    return (
        <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
            {isSubmitted ? (
                <div className="space-y-4 text-lg">
                    <h2 className="text-xl font-semibold">Publications</h2>
                    {currentPublications.map((pub, index) => (
                        <div key={index} className="border p-3 rounded-lg">
                            <p><strong>Title:</strong> {pub.title}</p>
                            <p><strong>Publisher:</strong> {pub.publisher}</p>
                            <p><strong>Publication Date:</strong> {pub.publicationDate}</p>
                            <p><strong>Description:</strong> {pub.description || 'No description provided'}</p>
                            <p><strong>Link:</strong> 
                                {pub.link ? (
                                    <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-2">
                                        {pub.link}
                                    </a>
                                ) : 'No link provided'}
                            </p>
                        </div>
                    ))}
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
                </div>
            ) : (
                <Form {...form}>
                    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {currentPublications.map((_, index) => (
                            <div key={index} className="border p-4 rounded-lg space-y-3 relative">
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                                    onClick={() => removePublication(index)}
                                    disabled={currentPublications.length <= 1}
                                >
                                    <X size={20} />
                                </button>
                                <h3 className="text-lg font-semibold">Publication {index + 1}</h3>

                                {["title", "publisher", "publicationDate"].map((fieldName) => (
                                    <FormField
                                        key={fieldName}
                                        control={form.control}
                                        name={`publications.${index}.${fieldName}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {fieldName.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        type={fieldName === "publicationDate" ? "date" : "text"} 
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
                                    name={`publications.${index}.description`}
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

                                <FormField
                                    control={form.control}
                                    name={`publications.${index}.link`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="url" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}

                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={addPublication}>
                                Add Another Publication
                            </Button>
                            <Button type="submit">Save Publications</Button>
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

export default PublicationInfo;