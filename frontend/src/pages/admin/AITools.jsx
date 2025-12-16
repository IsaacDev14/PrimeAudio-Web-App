import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Wand2, Copy, Sparkles, Loader2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { API_URL } from "../../config/api";

const AdminAITools = () => {
    const [formData, setFormData] = useState({
        product_name: "",
        category: "",
        features: ""
    });
    const [generatedDescription, setGeneratedDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/chat/generate-description`, {
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
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">AI Tools</h2>
                    <p className="text-gray-500 text-sm mt-1">Boost your productivity with AI-powered generators</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-600" />
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
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
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
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Result</CardTitle>
                                <CardDescription>Generated content will appear here.</CardDescription>
                            </div>
                            {generatedDescription && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="shrink-0"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2 text-green-600" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="h-full min-h-[400px] max-h-[600px] rounded-lg border bg-gray-50 p-6 overflow-y-auto">
                            {generatedDescription ? (
                                <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:marker:text-blue-600">
                                    <ReactMarkdown>{generatedDescription}</ReactMarkdown>
                                </article>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500">Fill the form and click Generate to create content...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AdminAITools
