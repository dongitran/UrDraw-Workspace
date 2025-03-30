"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { getAllCollectionsAndDrawings } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Fragment, useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
export default function WorkspaceLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const preloadSearchData = async () => {
      if (isAuthenticated() && !loading) {
        try {
          await getAllCollectionsAndDrawings();
        } catch (error) {
          console.error("Error preloading search data:", error);
        }
      }
    };

    preloadSearchData();
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading workspace..." />
      </div>
    );
  }

  return (
    <Fragment>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable
                  data={[
                    {
                      id: 1,
                      header: "Cover page",
                      type: "Cover page",
                      status: "In Process",
                      target: "18",
                      limit: "5",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 2,
                      header: "Table of contents",
                      type: "Table of contents",
                      status: "Done",
                      target: "29",
                      limit: "24",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 3,
                      header: "Executive summary",
                      type: "Narrative",
                      status: "Done",
                      target: "10",
                      limit: "13",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 4,
                      header: "Technical approach",
                      type: "Narrative",
                      status: "Done",
                      target: "27",
                      limit: "23",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 5,
                      header: "Design",
                      type: "Narrative",
                      status: "In Process",
                      target: "2",
                      limit: "16",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 6,
                      header: "Capabilities",
                      type: "Narrative",
                      status: "In Process",
                      target: "20",
                      limit: "8",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 7,
                      header: "Integration with existing systems",
                      type: "Narrative",
                      status: "In Process",
                      target: "19",
                      limit: "21",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 8,
                      header: "Innovation and Advantages",
                      type: "Narrative",
                      status: "Done",
                      target: "25",
                      limit: "26",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 9,
                      header: "Overview of EMR's Innovative Solutions",
                      type: "Technical content",
                      status: "Done",
                      target: "7",
                      limit: "23",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 10,
                      header: "Advanced Algorithms and Machine Learning",
                      type: "Narrative",
                      status: "Done",
                      target: "30",
                      limit: "28",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 11,
                      header: "Adaptive Communication Protocols",
                      type: "Narrative",
                      status: "Done",
                      target: "9",
                      limit: "31",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 12,
                      header: "Advantages Over Current Technologies",
                      type: "Narrative",
                      status: "Done",
                      target: "12",
                      limit: "0",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 13,
                      header: "Past Performance",
                      type: "Narrative",
                      status: "Done",
                      target: "22",
                      limit: "33",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 14,
                      header: "Customer Feedback and Satisfaction Levels",
                      type: "Narrative",
                      status: "Done",
                      target: "15",
                      limit: "34",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 15,
                      header: "Implementation Challenges and Solutions",
                      type: "Narrative",
                      status: "Done",
                      target: "3",
                      limit: "35",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 16,
                      header: "Security Measures and Data Protection Policies",
                      type: "Narrative",
                      status: "In Process",
                      target: "6",
                      limit: "36",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 17,
                      header: "Scalability and Future Proofing",
                      type: "Narrative",
                      status: "Done",
                      target: "4",
                      limit: "37",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 18,
                      header: "Cost-Benefit Analysis",
                      type: "Plain language",
                      status: "Done",
                      target: "14",
                      limit: "38",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 19,
                      header: "User Training and Onboarding Experience",
                      type: "Narrative",
                      status: "Done",
                      target: "17",
                      limit: "39",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 20,
                      header: "Future Development Roadmap",
                      type: "Narrative",
                      status: "Done",
                      target: "11",
                      limit: "40",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 21,
                      header: "System Architecture Overview",
                      type: "Technical content",
                      status: "In Process",
                      target: "24",
                      limit: "18",
                      reviewer: "Maya Johnson",
                    },
                    {
                      id: 22,
                      header: "Risk Management Plan",
                      type: "Narrative",
                      status: "Done",
                      target: "15",
                      limit: "22",
                      reviewer: "Carlos Rodriguez",
                    },
                    {
                      id: 23,
                      header: "Compliance Documentation",
                      type: "Legal",
                      status: "In Process",
                      target: "31",
                      limit: "27",
                      reviewer: "Sarah Chen",
                    },
                    {
                      id: 24,
                      header: "API Documentation",
                      type: "Technical content",
                      status: "Done",
                      target: "8",
                      limit: "12",
                      reviewer: "Raj Patel",
                    },
                    {
                      id: 25,
                      header: "User Interface Mockups",
                      type: "Visual",
                      status: "In Process",
                      target: "19",
                      limit: "25",
                      reviewer: "Leila Ahmadi",
                    },
                    {
                      id: 26,
                      header: "Database Schema",
                      type: "Technical content",
                      status: "Done",
                      target: "22",
                      limit: "20",
                      reviewer: "Thomas Wilson",
                    },
                    {
                      id: 27,
                      header: "Testing Methodology",
                      type: "Technical content",
                      status: "In Process",
                      target: "17",
                      limit: "14",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 28,
                      header: "Deployment Strategy",
                      type: "Narrative",
                      status: "Done",
                      target: "26",
                      limit: "30",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 29,
                      header: "Budget Breakdown",
                      type: "Financial",
                      status: "In Process",
                      target: "13",
                      limit: "16",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 30,
                      header: "Market Analysis",
                      type: "Research",
                      status: "Done",
                      target: "29",
                      limit: "32",
                      reviewer: "Sophia Martinez",
                    },
                    {
                      id: 31,
                      header: "Competitor Comparison",
                      type: "Research",
                      status: "In Process",
                      target: "21",
                      limit: "19",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 32,
                      header: "Maintenance Plan",
                      type: "Technical content",
                      status: "Done",
                      target: "16",
                      limit: "23",
                      reviewer: "Alex Thompson",
                    },
                    {
                      id: 33,
                      header: "User Personas",
                      type: "Research",
                      status: "In Process",
                      target: "27",
                      limit: "24",
                      reviewer: "Nina Patel",
                    },
                    {
                      id: 34,
                      header: "Accessibility Compliance",
                      type: "Legal",
                      status: "Done",
                      target: "18",
                      limit: "21",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 35,
                      header: "Performance Metrics",
                      type: "Technical content",
                      status: "In Process",
                      target: "23",
                      limit: "26",
                      reviewer: "David Kim",
                    },
                    {
                      id: 36,
                      header: "Disaster Recovery Plan",
                      type: "Technical content",
                      status: "Done",
                      target: "14",
                      limit: "17",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 37,
                      header: "Third-party Integrations",
                      type: "Technical content",
                      status: "In Process",
                      target: "25",
                      limit: "28",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 38,
                      header: "User Feedback Summary",
                      type: "Research",
                      status: "Done",
                      target: "20",
                      limit: "15",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 39,
                      header: "Localization Strategy",
                      type: "Narrative",
                      status: "In Process",
                      target: "12",
                      limit: "19",
                      reviewer: "Maria Garcia",
                    },
                    {
                      id: 40,
                      header: "Mobile Compatibility",
                      type: "Technical content",
                      status: "Done",
                      target: "28",
                      limit: "31",
                      reviewer: "James Wilson",
                    },
                    {
                      id: 41,
                      header: "Data Migration Plan",
                      type: "Technical content",
                      status: "In Process",
                      target: "19",
                      limit: "22",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 42,
                      header: "Quality Assurance Protocols",
                      type: "Technical content",
                      status: "Done",
                      target: "30",
                      limit: "33",
                      reviewer: "Priya Singh",
                    },
                    {
                      id: 43,
                      header: "Stakeholder Analysis",
                      type: "Research",
                      status: "In Process",
                      target: "11",
                      limit: "14",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 44,
                      header: "Environmental Impact Assessment",
                      type: "Research",
                      status: "Done",
                      target: "24",
                      limit: "27",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 45,
                      header: "Intellectual Property Rights",
                      type: "Legal",
                      status: "In Process",
                      target: "17",
                      limit: "20",
                      reviewer: "Sarah Johnson",
                    },
                    {
                      id: 46,
                      header: "Customer Support Framework",
                      type: "Narrative",
                      status: "Done",
                      target: "22",
                      limit: "25",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 47,
                      header: "Version Control Strategy",
                      type: "Technical content",
                      status: "In Process",
                      target: "15",
                      limit: "18",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 48,
                      header: "Continuous Integration Pipeline",
                      type: "Technical content",
                      status: "Done",
                      target: "26",
                      limit: "29",
                      reviewer: "Michael Chen",
                    },
                    {
                      id: 49,
                      header: "Regulatory Compliance",
                      type: "Legal",
                      status: "In Process",
                      target: "13",
                      limit: "16",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 50,
                      header: "User Authentication System",
                      type: "Technical content",
                      status: "Done",
                      target: "28",
                      limit: "31",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 51,
                      header: "Data Analytics Framework",
                      type: "Technical content",
                      status: "In Process",
                      target: "21",
                      limit: "24",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 52,
                      header: "Cloud Infrastructure",
                      type: "Technical content",
                      status: "Done",
                      target: "16",
                      limit: "19",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 53,
                      header: "Network Security Measures",
                      type: "Technical content",
                      status: "In Process",
                      target: "29",
                      limit: "32",
                      reviewer: "Lisa Wong",
                    },
                    {
                      id: 54,
                      header: "Project Timeline",
                      type: "Planning",
                      status: "Done",
                      target: "14",
                      limit: "17",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 55,
                      header: "Resource Allocation",
                      type: "Planning",
                      status: "In Process",
                      target: "27",
                      limit: "30",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 56,
                      header: "Team Structure and Roles",
                      type: "Planning",
                      status: "Done",
                      target: "20",
                      limit: "23",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 57,
                      header: "Communication Protocols",
                      type: "Planning",
                      status: "In Process",
                      target: "15",
                      limit: "18",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 58,
                      header: "Success Metrics",
                      type: "Planning",
                      status: "Done",
                      target: "30",
                      limit: "33",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 59,
                      header: "Internationalization Support",
                      type: "Technical content",
                      status: "In Process",
                      target: "23",
                      limit: "26",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 60,
                      header: "Backup and Recovery Procedures",
                      type: "Technical content",
                      status: "Done",
                      target: "18",
                      limit: "21",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 61,
                      header: "Monitoring and Alerting System",
                      type: "Technical content",
                      status: "In Process",
                      target: "25",
                      limit: "28",
                      reviewer: "Daniel Park",
                    },
                    {
                      id: 62,
                      header: "Code Review Guidelines",
                      type: "Technical content",
                      status: "Done",
                      target: "12",
                      limit: "15",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 63,
                      header: "Documentation Standards",
                      type: "Technical content",
                      status: "In Process",
                      target: "27",
                      limit: "30",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 64,
                      header: "Release Management Process",
                      type: "Planning",
                      status: "Done",
                      target: "22",
                      limit: "25",
                      reviewer: "Assign reviewer",
                    },
                    {
                      id: 65,
                      header: "Feature Prioritization Matrix",
                      type: "Planning",
                      status: "In Process",
                      target: "19",
                      limit: "22",
                      reviewer: "Emma Davis",
                    },
                    {
                      id: 66,
                      header: "Technical Debt Assessment",
                      type: "Technical content",
                      status: "Done",
                      target: "24",
                      limit: "27",
                      reviewer: "Eddie Lake",
                    },
                    {
                      id: 67,
                      header: "Capacity Planning",
                      type: "Planning",
                      status: "In Process",
                      target: "21",
                      limit: "24",
                      reviewer: "Jamik Tashpulatov",
                    },
                    {
                      id: 68,
                      header: "Service Level Agreements",
                      type: "Legal",
                      status: "Done",
                      target: "26",
                      limit: "29",
                      reviewer: "Assign reviewer",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Fragment>
  );
}
