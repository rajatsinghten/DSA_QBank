import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Loader2 } from "lucide-react";

function CertificationInfo({ formRef, onSuccess }) {
    const { id } = useParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const API_BASE_URL = "http://localhost:3000/api/v1";

    const form = useForm({
        defaultValues: {
            certifications: [{
                name: "",
                issuingOrganization: "",
                issueDate: "",
                expirationDate: "",
                credentialId: "",
                credentialURL: "",
            }]
        }
    });

    useEffect(() => {
        const fetchCertifications = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${id}/getprofile`);
                const profileData = response.data;
                
                if (profileData.certifications && profileData.certifications.length > 0) {
                    setIsSubmitted(true);
                    // Format dates for input fields
                    const formattedCerts = profileData.certifications.map(cert => ({
                        ...cert,
                        issueDate: cert.issueDate?.split('T')[0] || "",
                        expirationDate: cert.expirationDate?.split('T')[0] || ""
                    }));
                    form.reset({ certifications: formattedCerts });
                }
            } catch (error) {
                console.error('Error fetching certifications:', error);
                setFetchError(error.response?.data?.error || 'Failed to fetch certifications');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchCertifications();
    }, [id, form]);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/${id}/certifications`, {
                certifications: data.certifications
            });
            
            if (response.status === 200) {
                setIsSubmitted(true);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to update certifications';
            form.setError('root', { type: 'manual', message: errorMessage });
        }
    };

    const addCertification = () => {
        const currentCerts = form.getValues("certifications");
        form.setValue("certifications", [
            ...currentCerts,
            {
                name: "",
                issuingOrganization: "",
                issueDate: "",
                expirationDate: "",
                credentialId: "",
                credentialURL: ""
            }
        ]);
    };

    const removeCertification = (index) => {
        const currentCerts = form.getValues("certifications");
        const updatedCerts = currentCerts.filter((_, i) => i !== index);
        form.setValue("certifications", updatedCerts);
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

    const currentCerts = form.watch("certifications") || [];

    return (
        <Card className="p-4 w-full max-w-3xl bg-background border-none shadow-none">
            {isSubmitted ? (
                <div className="space-y-4 text-lg">
                    <h2 className="text-xl font-semibold">Certifications</h2>
                    {currentCerts.map((cert, index) => (
                        <div key={index} className="border p-3 rounded-lg">
                            <p><strong>Name:</strong> {cert.name}</p>
                            <p><strong>Issuing Organization:</strong> {cert.issuingOrganization}</p>
                            <p><strong>Issue Date:</strong> {cert.issueDate}</p>
                            <p><strong>Expiration Date:</strong> {cert.expirationDate || 'No expiration'}</p>
                            <p><strong>Credential ID:</strong> {cert.credentialId}</p>
                            <p><strong>Credential URL:</strong> 
                                {cert.credentialURL ? (
                                    <a href={cert.credentialURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-2">
                                        {cert.credentialURL}
                                    </a>
                                ) : 'Not provided'}
                            </p>
                        </div>
                    ))}
                    <Button variant="outline" onClick={() => setIsSubmitted(false)}>Edit</Button>
                </div>
            ) : (
                <Form {...form}>
                    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {currentCerts.map((cert, index) => (
                            <div key={index} className="border p-4 rounded-lg space-y-3 relative">
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                                    onClick={() => removeCertification(index)}
                                    disabled={currentCerts.length <= 1}
                                >
                                    <X size={20} />
                                </button>
                                <h3 className="text-lg font-semibold">Certification {index + 1}</h3>

                                {["name", "issuingOrganization", "issueDate", "expirationDate", "credentialId", "credentialURL"].map((field) => (
                                    <FormField
                                        key={field}
                                        control={form.control}
                                        name={`certifications.${index}.${field}`}
                                        render={({ field: inputField }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...inputField} 
                                                        type={field.includes("Date") ? "date" : "text"} 
                                                        required={field !== "expirationDate" && field !== "credentialURL"}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        ))}
                        <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={addCertification}>
                                Add Another Certification
                            </Button>
                            <Button type="submit">Save Certifications</Button>
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

export default CertificationInfo;