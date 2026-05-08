import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Scale,
    X,
    CheckCircle2,
    XCircle,
    DollarSign,
    MapPin,
    Users,
    Calendar,
    FileText,
    Phone,
    Mail,
    Globe,
    ArrowLeft,
    Download,
    Share2,
} from "lucide-react";
import { sampleSchemes, type Scheme } from "@/data/schemes";
import { useToast } from "@/hooks/use-toast";

const SchemeComparePanel = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [compareList, setCompareList] = useState<string[]>([]);
    const [schemesToCompare, setSchemesToCompare] = useState<Scheme[]>([]);

    useEffect(() => {
        // Load full scheme objects from localStorage (stored by SchemeDashboard)
        const savedData = localStorage.getItem("scheme_compare_data");
        const savedIds = localStorage.getItem("scheme_compare_list");
        if (savedIds) {
            const ids: string[] = JSON.parse(savedIds);
            setCompareList(ids);

            if (savedData) {
                const allData: Scheme[] = JSON.parse(savedData);
                setSchemesToCompare(allData.filter((s) => ids.includes(s.schemeId)));
            } else {
                // Fallback to sampleSchemes
                const schemes = sampleSchemes.filter((s) => ids.includes(s.schemeId));
                setSchemesToCompare(schemes);
            }
        }
    }, []);

    const removeFromCompare = (schemeId: string) => {
        const newList = compareList.filter((id) => id !== schemeId);
        setCompareList(newList);
        localStorage.setItem("scheme_compare_list", JSON.stringify(newList));

        const newSchemes = schemesToCompare.filter((s) => s.schemeId !== schemeId);
        setSchemesToCompare(newSchemes);
        localStorage.setItem("scheme_compare_data", JSON.stringify(newSchemes));

        toast({
            title: "Scheme Removed",
            description: "Scheme removed from comparison",
        });
    };

    const clearAll = () => {
        setCompareList([]);
        setSchemesToCompare([]);
        localStorage.setItem("scheme_compare_list", JSON.stringify([]));
        localStorage.setItem("scheme_compare_data", JSON.stringify([]));

        toast({
            title: "Comparison Cleared",
            description: "All schemes removed from comparison",
        });
    };

    const exportComparison = () => {
        // Create a simple text export
        let exportText = "SCHEME COMPARISON REPORT\n";
        exportText += "=".repeat(80) + "\n\n";

        schemesToCompare.forEach((scheme, idx) => {
            exportText += `${idx + 1}. ${scheme.schemeName}\n`;
            exportText += `   Category: ${scheme.category}\n`;
            exportText += `   Benefit: PKR ${scheme.benefits.financial.amount.toLocaleString()} (${scheme.benefits.financial.frequency})\n`;
            exportText += `   Department: ${scheme.department}\n`;
            exportText += `   Province: ${scheme.province}\n`;
            exportText += `   Eligibility: Income PKR ${scheme.eligibility.income.min.toLocaleString()}-${scheme.eligibility.income.max.toLocaleString()}, Age ${scheme.eligibility.age.min}-${scheme.eligibility.age.max}\n`;
            exportText += `   Website: ${scheme.contact.website}\n`;
            exportText += "\n";
        });

        // Create download
        const blob = new Blob([exportText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scheme-comparison-${new Date().toISOString().split("T")[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
            title: "Export Successful",
            description: "Comparison report downloaded",
        });
    };

    const shareComparison = () => {
        const shareText = `I'm comparing ${schemesToCompare.length} government schemes on Awam Assist: ${schemesToCompare.map(s => s.shortName).join(", ")}`;

        if (navigator.share) {
            navigator.share({
                title: "Scheme Comparison",
                text: shareText,
            }).catch(() => {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareText);
                toast({
                    title: "Copied to Clipboard",
                    description: "Share text copied to clipboard",
                });
            });
        } else {
            navigator.clipboard.writeText(shareText);
            toast({
                title: "Copied to Clipboard",
                description: "Share text copied to clipboard",
            });
        }
    };

    if (schemesToCompare.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/schemes/dashboard")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Compare Schemes</h1>
                            <p className="text-gray-600 mt-1">Side-by-side comparison of government schemes</p>
                        </div>
                    </div>
                </div>

                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
                            <Scale className="h-8 w-8 text-[#7c3aed]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schemes to Compare</h3>
                            <p className="text-gray-600 mb-4">
                                Add schemes from the dashboard to start comparing them side-by-side.
                            </p>
                        </div>
                        <Button
                            className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                            onClick={() => navigate("/schemes/dashboard")}
                        >
                            Browse Schemes
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/schemes/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Compare Schemes</h1>
                        <p className="text-gray-600 mt-1">
                            Comparing {schemesToCompare.length} scheme{schemesToCompare.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={shareComparison}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportComparison}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                </div>
            </div>

            {/* Scheme Cards Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schemesToCompare.map((scheme) => (
                    <Card key={scheme.schemeId} className="relative border-2 border-[#7c3aed]/20">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => removeFromCompare(scheme.schemeId)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <CardHeader className="pb-3">
                            <Badge className="w-fit bg-[#7c3aed] text-white mb-2">
                                {scheme.category}
                            </Badge>
                            <CardTitle className="text-lg">{scheme.schemeName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-[#7c3aed]" />
                                    <span className="font-semibold">
                                        PKR {scheme.benefits.financial.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>{scheme.province}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Comparison Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-[#7c3aed]" />
                        Detailed Comparison
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px] font-semibold">Criteria</TableHead>
                                {schemesToCompare.map((scheme) => (
                                    <TableHead key={scheme.schemeId} className="font-semibold">
                                        {scheme.shortName}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Category */}
                            <TableRow>
                                <TableCell className="font-medium">Category</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        <Badge variant="outline">{scheme.category}</Badge>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Financial Benefit */}
                            <TableRow className="bg-[#7c3aed]/5">
                                <TableCell className="font-medium">Financial Benefit</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        <div className="font-semibold text-[#7c3aed]">
                                            PKR {scheme.benefits.financial.amount.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {scheme.benefits.financial.frequency}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Non-Financial Benefits */}
                            <TableRow>
                                <TableCell className="font-medium">Additional Benefits</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        {scheme.benefits.nonFinancial.length > 0 ? (
                                            <ul className="text-sm space-y-1">
                                                {scheme.benefits.nonFinancial.slice(0, 3).map((benefit, idx) => (
                                                    <li key={idx} className="flex items-start gap-1">
                                                        <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                                {scheme.benefits.nonFinancial.length > 3 && (
                                                    <li className="text-gray-500">
                                                        +{scheme.benefits.nonFinancial.length - 3} more
                                                    </li>
                                                )}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-400">None</span>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Income Eligibility */}
                            <TableRow className="bg-gray-50">
                                <TableCell className="font-medium">Income Range</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId} className="text-sm">
                                        PKR {scheme.eligibility.income.min.toLocaleString()} -{" "}
                                        {scheme.eligibility.income.max.toLocaleString()}
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Age Eligibility */}
                            <TableRow>
                                <TableCell className="font-medium">Age Range</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId} className="text-sm">
                                        {scheme.eligibility.age.min} - {scheme.eligibility.age.max} years
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Categories */}
                            <TableRow className="bg-gray-50">
                                <TableCell className="font-medium">Target Categories</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        <div className="flex flex-wrap gap-1">
                                            {scheme.eligibility.categories.slice(0, 2).map((cat, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                    {cat}
                                                </Badge>
                                            ))}
                                            {scheme.eligibility.categories.length > 2 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{scheme.eligibility.categories.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Province */}
                            <TableRow>
                                <TableCell className="font-medium">Province</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-[#7c3aed]" />
                                            <span>{scheme.province}</span>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Application Method */}
                            <TableRow className="bg-[#7c3aed]/5">
                                <TableCell className="font-medium">Application Method</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        <Badge variant="outline">{scheme.application.method}</Badge>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Processing Time */}
                            <TableRow>
                                <TableCell className="font-medium">Processing Time</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId} className="text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {scheme.application.processingTime}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Required Documents */}
                            <TableRow className="bg-gray-50">
                                <TableCell className="font-medium">Required Documents</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        <div className="text-sm space-y-1">
                                            {scheme.application.requiredDocuments.slice(0, 3).map((doc, idx) => (
                                                <div key={idx} className="flex items-start gap-1">
                                                    <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <span>{doc}</span>
                                                </div>
                                            ))}
                                            {scheme.application.requiredDocuments.length > 3 && (
                                                <div className="text-gray-500">
                                                    +{scheme.application.requiredDocuments.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Application Status */}
                            <TableRow>
                                <TableCell className="font-medium">Application Status</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        {scheme.application.isOpen ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="font-medium">Open</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <XCircle className="h-4 w-4" />
                                                <span className="font-medium">Closed</span>
                                            </div>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Contact Helpline */}
                            <TableRow className="bg-gray-50">
                                <TableCell className="font-medium">Helpline</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        <div className="text-sm space-y-1">
                                            {scheme.contact.helpline.map((phone, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3 text-[#7c3aed]" />
                                                    <span>{phone}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Website */}
                            <TableRow>
                                <TableCell className="font-medium">Website</TableCell>
                                {schemesToCompare.map((scheme) => (
                                    <TableCell key={scheme.schemeId}>
                                        <a
                                            href={scheme.contact.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-[#7c3aed] hover:underline text-sm"
                                        >
                                            <Globe className="h-4 w-4" />
                                            Visit Site
                                        </a>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Beneficiaries */}
                            {schemesToCompare.some((s) => s.stats) && (
                                <TableRow className="bg-[#7c3aed]/5">
                                    <TableCell className="font-medium">Total Beneficiaries</TableCell>
                                    {schemesToCompare.map((scheme) => (
                                        <TableCell key={scheme.schemeId}>
                                            {scheme.stats ? (
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-[#7c3aed]" />
                                                    <span className="font-semibold">
                                                        {(scheme.stats.beneficiaries / 1000000).toFixed(1)}M
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/schemes/dashboard")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
                <Button
                    className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                    onClick={exportComparison}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download Comparison
                </Button>
            </div>
        </div>
    );
};

export default SchemeComparePanel;
