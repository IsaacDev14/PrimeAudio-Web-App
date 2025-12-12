import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Wand2, Copy, Sparkles, Loader2 } from "lucide-react";

const AdminAITools = () => {
    const [formData, setFormData] = useState({
        product_name: "",
        category: "",
        features: ""
    });
    const [generatedDescription, setGeneratedDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8000/chat/generate-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedDescription(data.description);
            } else {
                setGeneratedDescription("Error generating description. Please try again.");
            }
        } catch (error) {
            console.error("Generator error:", error);
            setGeneratedDescription("Network error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedDescription);
        // Optional: Show toast
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Tools</h2>
                    <p className="text-muted-foreground">Boost your productivity with AI-powered generators</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Input Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Description Generator
                        </CardTitle>
                        <CardDescription>
                            Create professional product descriptions in seconds.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product_name">Product Name</Label>
                                <Input
                                    id="product_name"
                                    name="product_name"
                                    placeholder="e.g., Yamaha PSR-E373"
                                    value={formData.product_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    placeholder="e.g., Keyboard"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="features">Key Features (comma separated)</Label>
                                <Textarea
                                    id="features"
                                    name="features"
                                    placeholder="e.g., Touch sensitive keys, 622 voices, USB to Host"
                                    value={formData.features}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-4 w-4" />
                                        Generate Description
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Output Section */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                        <CardDescription>Generated content will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="relative h-full min-h-[300px] rounded-md border bg-muted/50 p-4 overflow-y-auto whitespace-pre-wrap">
                            {generatedDescription ? (
                                <div dangerouslySetInnerHTML={{ __html: generatedDescription }} />
                            ) : (
                                <p className="text-muted-foreground text-center pt-20">Fill the form to generate content...</p>
                            )}

                            {generatedDescription && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={copyToClipboard}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AdminAITools
