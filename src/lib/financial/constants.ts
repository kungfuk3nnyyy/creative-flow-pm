/**
 * Budget category templates for different project types.
 * Each template defines categories and their default allocation
 * as basis points (must sum to 10000 = 100%).
 */
export interface BudgetTemplate {
  label: string;
  categories: { name: string; allocationBasisPoints: number }[];
}

export const BUDGET_TEMPLATES: Record<string, BudgetTemplate> = {
  INTERIOR_DESIGN: {
    label: "Interior Design",
    categories: [
      { name: "Design & Concept", allocationBasisPoints: 1500 },
      { name: "Furniture & Fixtures", allocationBasisPoints: 2500 },
      { name: "Materials & Finishes", allocationBasisPoints: 2000 },
      { name: "Labor & Installation", allocationBasisPoints: 2000 },
      { name: "Lighting", allocationBasisPoints: 800 },
      { name: "Art & Accessories", allocationBasisPoints: 500 },
      { name: "Contingency", allocationBasisPoints: 700 },
    ],
  },
  CONFERENCE_DECOR: {
    label: "Conference Decor",
    categories: [
      { name: "Venue & Space", allocationBasisPoints: 2000 },
      { name: "Floral & Greenery", allocationBasisPoints: 1500 },
      { name: "Signage & Graphics", allocationBasisPoints: 1000 },
      { name: "AV & Lighting", allocationBasisPoints: 1500 },
      { name: "Furniture Rental", allocationBasisPoints: 1200 },
      { name: "Staffing", allocationBasisPoints: 1000 },
      { name: "Catering", allocationBasisPoints: 1000 },
      { name: "Contingency", allocationBasisPoints: 800 },
    ],
  },
  EXHIBITION: {
    label: "Exhibition",
    categories: [
      { name: "Design & Planning", allocationBasisPoints: 1200 },
      { name: "Fabrication", allocationBasisPoints: 2500 },
      { name: "Graphics & Print", allocationBasisPoints: 1200 },
      { name: "AV & Technology", allocationBasisPoints: 1500 },
      { name: "Transport & Logistics", allocationBasisPoints: 1000 },
      { name: "Installation & Dismantle", allocationBasisPoints: 1200 },
      { name: "Staffing", allocationBasisPoints: 600 },
      { name: "Contingency", allocationBasisPoints: 800 },
    ],
  },
  INSTALLATION: {
    label: "Installation",
    categories: [
      { name: "Design & Engineering", allocationBasisPoints: 2000 },
      { name: "Materials", allocationBasisPoints: 2500 },
      { name: "Fabrication", allocationBasisPoints: 2000 },
      { name: "Installation Labor", allocationBasisPoints: 1500 },
      { name: "Transport", allocationBasisPoints: 800 },
      { name: "Permits & Insurance", allocationBasisPoints: 500 },
      { name: "Contingency", allocationBasisPoints: 700 },
    ],
  },
  EXPERIENTIAL: {
    label: "Experiential",
    categories: [
      { name: "Creative & Strategy", allocationBasisPoints: 1500 },
      { name: "Production & Build", allocationBasisPoints: 2000 },
      { name: "Technology & Interactive", allocationBasisPoints: 1500 },
      { name: "Staffing & Talent", allocationBasisPoints: 1200 },
      { name: "Venue & Logistics", allocationBasisPoints: 1200 },
      { name: "Marketing & Promotion", allocationBasisPoints: 800 },
      { name: "Catering & Hospitality", allocationBasisPoints: 1000 },
      { name: "Contingency", allocationBasisPoints: 800 },
    ],
  },
  OTHER: {
    label: "General Project",
    categories: [
      { name: "Design & Planning", allocationBasisPoints: 1500 },
      { name: "Materials & Supplies", allocationBasisPoints: 2500 },
      { name: "Labor & Services", allocationBasisPoints: 2500 },
      { name: "Equipment & Rental", allocationBasisPoints: 1500 },
      { name: "Travel & Logistics", allocationBasisPoints: 1000 },
      { name: "Contingency", allocationBasisPoints: 1000 },
    ],
  },
};
