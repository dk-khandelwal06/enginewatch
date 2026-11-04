"use client";

import React from "react";
import { HeroSection } from "@/sections/HeroSection";
import { AboutSection } from "@/sections/AboutSection";
import { DashboardSection } from "@/sections/DashboardSection";
import { FleetMonitoringSection } from "@/sections/FleetMonitoringSection";
import { PredictionLabSection } from "@/sections/PredictionLabSection";
import { DegradationSection } from "@/sections/DegradationSection";
import { FlightOpsSection } from "@/sections/FlightOpsSection";
import { ApiCenterSection } from "@/sections/ApiCenterSection";
import { SecurityCenterSection } from "@/sections/SecurityCenterSection";
import { TechnologyCenterSection } from "@/sections/TechnologyCenterSection";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <AboutSection />
      <DashboardSection />
      <FleetMonitoringSection />
      <PredictionLabSection />
      <DegradationSection />
      <FlightOpsSection />
      <ApiCenterSection />
      <SecurityCenterSection />
      <TechnologyCenterSection />
    </div>
  );
}

