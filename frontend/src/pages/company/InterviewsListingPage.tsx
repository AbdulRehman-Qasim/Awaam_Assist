interface Candidate {
  _id: string;
  name: string;
  email: string;
  jobApplied: {
    _id: string;
    title: string;
  };
  company: string;
  date: string;
  status: "Scheduled" | "Completed" | "Expired" | "Pending";
  score: number | null;
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Star,
  Search,
  Briefcase,
  Play,
} from "lucide-react";
import Loading from "@/components/ui/loading";

const InterviewsListingPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // 🆕 State for search

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/company/candidates`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("data on Interviews Listing Page:", data);
        if (data.success) {
          setCandidates(data.candidates);
        } else {
          throw new Error(data.message || "Failed to fetch candidates");
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // 🔍 Filter candidates based on status, job, and name search
  const filteredCandidates = candidates
    .filter((candidate) => candidate.jobApplied && candidate.jobApplied.title)
    .filter((candidate) => {
      const statusMatch =
        filter === "all" || candidate.status.toLowerCase() === filter;
      const jobMatch =
        jobFilter === "all" || candidate.jobApplied.title === jobFilter;
      const searchMatch = candidate.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return statusMatch && jobMatch && searchMatch;
    })
    .sort((a, b) => {
      const scoreA = a.score !== null && a.score !== undefined ? a.score : -1;
      const scoreB = b.score !== null && b.score !== undefined ? b.score : -1;
      return scoreB - scoreA;
    });

  const uniqueJobs =
    candidates.length > 0
      ? [
          ...new Set(
            candidates
              .filter(
                (candidate) =>
                  candidate.jobApplied && candidate.jobApplied.title
              )
              .map((candidate) => candidate.jobApplied.title)
          ),
        ]
      : [];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "expired":
        return (
          <Badge variant="outline" className="text-gray-500">
            Expired
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <Loading message="Loading interviews..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Interviews</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search candidates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // 🆕 Search logic
              />
            </div>
            <div className="w-full sm:w-48">
              <Select defaultValue="all" onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select defaultValue="all" onValueChange={setJobFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {uniqueJobs.length > 0 ? (
                    uniqueJobs.map((job) => (
                      <SelectItem key={job} value={job}>
                        {job}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No jobs available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead className="hidden md:table-cell">Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Date/Time
                  </TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <TableRow key={candidate._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={candidate.name} />
                            <AvatarFallback>
                              {candidate.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{candidate.name}</div>
                            <div className="text-xs text-gray-500">
                              {candidate.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          {candidate.jobApplied ? (
                            <Link
                              to={`/company/jobs/${candidate.jobApplied._id}`}
                              className="hover:text-primary-600"
                            >
                              {candidate.jobApplied.title || "Untitled Job"}
                            </Link>
                          ) : (
                            <span className="text-gray-500">
                              No job assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {candidate.date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(candidate.date).toLocaleDateString()}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.score !== null && candidate.score !== undefined ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{Number(candidate.score).toFixed(2)}%</span>
                          </div>
                        ) : candidate.status === "Completed" ? (
                          <span className="text-gray-400 text-sm">Processing...</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {candidate.status === "Completed" ? (
                          <Link to={`/company/interviews/${candidate._id}`}>
                            <Button size="sm">
                              <Play className="h-3 w-3 mr-1" />
                              View Results
                            </Button>
                          </Link>
                        ) : candidate.status === "Scheduled" ? (
                          <Button
                            size="sm"
                            className="bg-yellow-400 text-black"
                          >
                            Pending
                          </Button>
                        ) : candidate.status === "Expired" ? (
                          <Button size="sm" variant="outline">
                            Reinvite
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {candidates.length === 0
                        ? "No candidates available."
                        : "No candidates match the selected filters or search."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between w-full text-xs text-gray-500">
            <div>
              {candidates.length > 0
                ? `Showing ${filteredCandidates.length} of ${candidates.length} candidates`
                : "No candidates available"}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 px-3">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-3">
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InterviewsListingPage;
