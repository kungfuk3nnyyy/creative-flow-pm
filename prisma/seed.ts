import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.expenseAttachment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectVendor.deleteMany();
  await prisma.projectTeam.deleteMany();
  await prisma.projectFile.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.financialAuditLog.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.project.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await hash("password123", 12);

  // ──────────────────────────────────────
  // Organization
  // ──────────────────────────────────────
  const org = await prisma.organization.create({
    data: {
      id: "org_kilibasi",
      name: "Kilibasi Design Studio",
      slug: "kilibasi-design-studio",
      address: "Nairobi, Kenya",
      phone: "+254 700 000 000",
      email: "studio@kilibasi.co.ke",
      website: "https://kilibasi.co.ke",
      currency: "KES",
      taxRateBasisPoints: 1600,
      invoicePrefix: "KDS",
      invoiceNextNumber: 4,
    },
  });

  // ──────────────────────────────────────
  // Users (one per role)
  // ──────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      id: "user_admin",
      organizationId: org.id,
      email: "amani@kilibasi.co.ke",
      name: "Amani Ochieng",
      passwordHash,
      role: "ADMIN",
      isActive: true,
      lastLoginAt: new Date("2026-02-05T10:00:00Z"),
    },
  });

  const manager = await prisma.user.create({
    data: {
      id: "user_manager",
      organizationId: org.id,
      email: "fatima@kilibasi.co.ke",
      name: "Fatima Wanjiku",
      passwordHash,
      role: "MANAGER",
      isActive: true,
      lastLoginAt: new Date("2026-02-04T14:30:00Z"),
    },
  });

  const finance = await prisma.user.create({
    data: {
      id: "user_finance",
      organizationId: org.id,
      email: "kwame@kilibasi.co.ke",
      name: "Kwame Mwangi",
      passwordHash,
      role: "FINANCE",
      isActive: true,
      lastLoginAt: new Date("2026-02-05T08:15:00Z"),
    },
  });

  const member = await prisma.user.create({
    data: {
      id: "user_member",
      organizationId: org.id,
      email: "zuri@kilibasi.co.ke",
      name: "Zuri Kamau",
      passwordHash,
      role: "MEMBER",
      isActive: true,
      lastLoginAt: new Date("2026-02-03T16:45:00Z"),
    },
  });

  const viewer = await prisma.user.create({
    data: {
      id: "user_viewer",
      organizationId: org.id,
      email: "jabari@kilibasi.co.ke",
      name: "Jabari Otieno",
      passwordHash,
      role: "VIEWER",
      isActive: true,
      lastLoginAt: new Date("2026-01-28T11:00:00Z"),
    },
  });

  // ──────────────────────────────────────
  // Teams
  // ──────────────────────────────────────
  const designTeam = await prisma.team.create({
    data: {
      id: "team_design",
      organizationId: org.id,
      name: "Design",
      description: "Spatial design, interiors, and visual identity",
    },
  });

  const fabricationTeam = await prisma.team.create({
    data: {
      id: "team_fabrication",
      organizationId: org.id,
      name: "Fabrication",
      description: "Build, installation, and on-site execution",
    },
  });

  const eventsTeam = await prisma.team.create({
    data: {
      id: "team_events",
      organizationId: org.id,
      name: "Events & Logistics",
      description: "Event coordination, vendor management, and logistics",
    },
  });

  // Team members
  await prisma.teamMember.createMany({
    data: [
      { id: "tm_1", teamId: designTeam.id, userId: admin.id },
      { id: "tm_2", teamId: designTeam.id, userId: member.id },
      { id: "tm_3", teamId: fabricationTeam.id, userId: manager.id },
      { id: "tm_4", teamId: fabricationTeam.id, userId: member.id },
      { id: "tm_5", teamId: eventsTeam.id, userId: manager.id },
      { id: "tm_6", teamId: eventsTeam.id, userId: admin.id },
    ],
  });

  // ──────────────────────────────────────
  // Vendors
  // ──────────────────────────────────────
  const vendorFab = await prisma.vendor.create({
    data: {
      id: "vendor_fab",
      organizationId: org.id,
      name: "Artisan Metalworks",
      category: "FABRICATION",
      email: "info@artisanmetal.co.ke",
      phone: "+254 711 111 111",
      contactName: "Daniel Kiprono",
      rating: 5,
      isActive: true,
    },
  });

  const vendorPrint = await prisma.vendor.create({
    data: {
      id: "vendor_print",
      organizationId: org.id,
      name: "Nairobi Print House",
      category: "PRINTING",
      email: "orders@nairobiprinthouse.co.ke",
      phone: "+254 722 222 222",
      contactName: "Grace Njeri",
      rating: 4,
      isActive: true,
    },
  });

  const vendorAV = await prisma.vendor.create({
    data: {
      id: "vendor_av",
      organizationId: org.id,
      name: "SoundStage East Africa",
      category: "AV",
      email: "bookings@soundstage.co.ke",
      phone: "+254 733 333 333",
      contactName: "Brian Omondi",
      rating: 4,
      isActive: true,
    },
  });

  const vendorFurniture = await prisma.vendor.create({
    data: {
      id: "vendor_furniture",
      organizationId: org.id,
      name: "Heritage Timber & Craft",
      category: "FURNITURE",
      email: "sales@heritagetimber.co.ke",
      phone: "+254 744 444 444",
      contactName: "Peter Mutua",
      rating: 5,
      isActive: true,
    },
  });

  const vendorLighting = await prisma.vendor.create({
    data: {
      id: "vendor_lighting",
      organizationId: org.id,
      name: "Lumen Studio Nairobi",
      category: "LIGHTING",
      email: "hello@lumenstudio.co.ke",
      phone: "+254 755 555 555",
      contactName: "Aisha Hassan",
      rating: 4,
      isActive: true,
    },
  });

  const vendorSignage = await prisma.vendor.create({
    data: {
      id: "vendor_signage",
      organizationId: org.id,
      name: "SignCraft Kenya",
      category: "SIGNAGE",
      email: "info@signcraft.co.ke",
      phone: "+254 766 666 666",
      contactName: "Joseph Wekesa",
      rating: 3,
      isActive: true,
    },
  });

  const vendorCatering = await prisma.vendor.create({
    data: {
      id: "vendor_catering",
      organizationId: org.id,
      name: "Savanna Kitchen Catering",
      category: "CATERING",
      email: "events@savannakitchen.co.ke",
      phone: "+254 777 777 777",
      contactName: "Rose Wambui",
      rating: 5,
      isActive: true,
    },
  });

  const vendorPhoto = await prisma.vendor.create({
    data: {
      id: "vendor_photo",
      organizationId: org.id,
      name: "Lens & Light Photography",
      category: "PHOTOGRAPHY",
      email: "book@lensandlight.co.ke",
      phone: "+254 788 888 888",
      contactName: "Samuel Njoroge",
      rating: 5,
      isActive: true,
    },
  });

  // ================================================================
  // PROJECT 1: assembly event design & logistics (COMPLETED)
  //
  // Demonstrates: fully completed project lifecycle with all
  // milestones done, expenses approved/reimbursed, invoices paid,
  // and full activity history.
  // ================================================================
  const project1 = await prisma.project.create({
    data: {
      id: "proj_assembly_event",
      organizationId: org.id,
      name: "assembly event design & logistics",
      description:
        "Full event design and logistics coordination for the Assembly conference. Includes venue spatial design, branded environments, schedule wall graphics, pop-up layout, and on-site coordination across a two-day programme.",
      type: "EXPERIENTIAL",
      status: "COMPLETED",
      clientName: "Assembly Nairobi",
      clientEmail: "partnerships@assembly.co.ke",
      clientPhone: "+254 700 100 100",
      clientAddress: "The Alchemist, Westlands, Nairobi",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-10-15"),
    },
  });

  // Project 1 - teams
  await prisma.projectTeam.createMany({
    data: [
      { id: "pt_1a", projectId: project1.id, teamId: designTeam.id },
      { id: "pt_1b", projectId: project1.id, teamId: eventsTeam.id },
    ],
  });

  // Project 1 - vendors
  await prisma.projectVendor.createMany({
    data: [
      { id: "pv_1a", projectId: project1.id, vendorId: vendorPrint.id },
      { id: "pv_1b", projectId: project1.id, vendorId: vendorAV.id },
      { id: "pv_1c", projectId: project1.id, vendorId: vendorSignage.id },
      { id: "pv_1d", projectId: project1.id, vendorId: vendorCatering.id },
      { id: "pv_1e", projectId: project1.id, vendorId: vendorPhoto.id },
    ],
  });

  // Project 1 - milestones and tasks
  const ms1_1 = await prisma.milestone.create({
    data: {
      id: "ms_1_concept",
      projectId: project1.id,
      name: "Concept & spatial planning",
      description: "Initial venue walkthrough, concept development, and spatial layout planning",
      sortOrder: 0,
      dueDate: new Date("2025-09-10"),
      completedAt: new Date("2025-09-09"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_1_1",
        milestoneId: ms1_1.id,
        title: "Venue site survey and measurements",
        status: "DONE",
        priority: "HIGH",
        assigneeId: admin.id,
        creatorId: admin.id,
        dueDate: new Date("2025-09-03"),
        completedAt: new Date("2025-09-02"),
        sortOrder: 0,
      },
      {
        id: "task_1_2",
        milestoneId: ms1_1.id,
        title: "Develop spatial layout for ground floor zones",
        status: "DONE",
        priority: "HIGH",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2025-09-07"),
        completedAt: new Date("2025-09-06"),
        sortOrder: 1,
      },
      {
        id: "task_1_3",
        milestoneId: ms1_1.id,
        title: "Present concept boards to client",
        status: "DONE",
        priority: "MEDIUM",
        assigneeId: admin.id,
        creatorId: admin.id,
        dueDate: new Date("2025-09-10"),
        completedAt: new Date("2025-09-09"),
        sortOrder: 2,
      },
    ],
  });

  const ms1_2 = await prisma.milestone.create({
    data: {
      id: "ms_1_production",
      projectId: project1.id,
      name: "Production & fabrication",
      description: "Produce all branded elements, schedule wall, signage, and rug layout",
      sortOrder: 1,
      dueDate: new Date("2025-09-28"),
      completedAt: new Date("2025-09-27"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_1_4",
        milestoneId: ms1_2.id,
        title: "Design and produce schedule wall graphics",
        status: "DONE",
        priority: "HIGH",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2025-09-18"),
        completedAt: new Date("2025-09-17"),
        sortOrder: 0,
      },
      {
        id: "task_1_5",
        milestoneId: ms1_2.id,
        title: "Order large-format prints for branded walls",
        status: "DONE",
        priority: "HIGH",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2025-09-15"),
        completedAt: new Date("2025-09-14"),
        sortOrder: 1,
      },
      {
        id: "task_1_6",
        milestoneId: ms1_2.id,
        title: "Coordinate AV setup requirements with venue",
        status: "DONE",
        priority: "MEDIUM",
        assigneeId: manager.id,
        creatorId: manager.id,
        dueDate: new Date("2025-09-20"),
        completedAt: new Date("2025-09-19"),
        sortOrder: 2,
      },
      {
        id: "task_1_7",
        milestoneId: ms1_2.id,
        title: "Source and arrange patterned rugs for courtyard",
        status: "DONE",
        priority: "MEDIUM",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2025-09-25"),
        completedAt: new Date("2025-09-24"),
        sortOrder: 3,
      },
    ],
  });

  const ms1_3 = await prisma.milestone.create({
    data: {
      id: "ms_1_event",
      projectId: project1.id,
      name: "Event execution & wrap-up",
      description: "On-site installation, event day coordination, and post-event teardown",
      sortOrder: 2,
      dueDate: new Date("2025-10-15"),
      completedAt: new Date("2025-10-14"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_1_8",
        milestoneId: ms1_3.id,
        title: "On-site installation day 1 (signage, rugs, furniture)",
        status: "DONE",
        priority: "URGENT",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2025-10-03"),
        completedAt: new Date("2025-10-03"),
        sortOrder: 0,
      },
      {
        id: "task_1_9",
        milestoneId: ms1_3.id,
        title: "Event day coordination and troubleshooting",
        status: "DONE",
        priority: "URGENT",
        assigneeId: manager.id,
        creatorId: manager.id,
        dueDate: new Date("2025-10-05"),
        completedAt: new Date("2025-10-05"),
        sortOrder: 1,
      },
      {
        id: "task_1_10",
        milestoneId: ms1_3.id,
        title: "Post-event teardown and asset return",
        status: "DONE",
        priority: "HIGH",
        assigneeId: member.id,
        creatorId: manager.id,
        dueDate: new Date("2025-10-08"),
        completedAt: new Date("2025-10-07"),
        sortOrder: 2,
      },
      {
        id: "task_1_11",
        milestoneId: ms1_3.id,
        title: "Final photo documentation and client handover",
        status: "DONE",
        priority: "MEDIUM",
        assigneeId: admin.id,
        creatorId: admin.id,
        dueDate: new Date("2025-10-15"),
        completedAt: new Date("2025-10-14"),
        sortOrder: 3,
      },
    ],
  });

  // Project 1 - budget (KES 1,850,000 = 185000000 cents)
  const budget1 = await prisma.budget.create({
    data: {
      id: "budget_1",
      projectId: project1.id,
      totalAmountCents: 185000000,
      approvedAt: new Date("2025-09-02"),
      approvedById: admin.id,
      notes: "Approved budget for full event design and logistics scope",
    },
  });

  const bc1_print = await prisma.budgetCategory.create({
    data: {
      id: "bc_1_print",
      budgetId: budget1.id,
      name: "Printing & graphics",
      allocatedCents: 45000000,
      sortOrder: 0,
    },
  });

  const bc1_av = await prisma.budgetCategory.create({
    data: {
      id: "bc_1_av",
      budgetId: budget1.id,
      name: "AV equipment",
      allocatedCents: 35000000,
      sortOrder: 1,
    },
  });

  const bc1_catering = await prisma.budgetCategory.create({
    data: {
      id: "bc_1_catering",
      budgetId: budget1.id,
      name: "Catering & hospitality",
      allocatedCents: 40000000,
      sortOrder: 2,
    },
  });

  const bc1_signage = await prisma.budgetCategory.create({
    data: {
      id: "bc_1_signage",
      budgetId: budget1.id,
      name: "Signage & wayfinding",
      allocatedCents: 25000000,
      sortOrder: 3,
    },
  });

  const bc1_photo = await prisma.budgetCategory.create({
    data: {
      id: "bc_1_photo",
      budgetId: budget1.id,
      name: "Photography & documentation",
      allocatedCents: 15000000,
      sortOrder: 4,
    },
  });

  await prisma.budgetCategory.create({
    data: {
      id: "bc_1_contingency",
      budgetId: budget1.id,
      name: "Contingency",
      allocatedCents: 25000000,
      sortOrder: 5,
    },
  });

  // Project 1 - expenses (all approved/reimbursed for completed project)
  await prisma.expense.createMany({
    data: [
      {
        id: "exp_1_1",
        organizationId: org.id,
        projectId: project1.id,
        budgetCategoryId: bc1_print.id,
        vendorId: vendorPrint.id,
        description: "Large-format wall prints (schedule wall, branded panels)",
        amountCents: 42000000,
        date: new Date("2025-09-15"),
        status: "REIMBURSED",
        submittedById: manager.id,
        approvedById: finance.id,
        approvedAt: new Date("2025-09-16"),
      },
      {
        id: "exp_1_2",
        organizationId: org.id,
        projectId: project1.id,
        budgetCategoryId: bc1_av.id,
        vendorId: vendorAV.id,
        description: "PA system and stage lighting rental (2-day event)",
        amountCents: 32000000,
        date: new Date("2025-09-28"),
        status: "REIMBURSED",
        submittedById: manager.id,
        approvedById: finance.id,
        approvedAt: new Date("2025-09-29"),
      },
      {
        id: "exp_1_3",
        organizationId: org.id,
        projectId: project1.id,
        budgetCategoryId: bc1_catering.id,
        vendorId: vendorCatering.id,
        description: "Catering for 2-day event (day 1 and day 2 lunch, mixer refreshments)",
        amountCents: 38500000,
        date: new Date("2025-10-01"),
        status: "REIMBURSED",
        submittedById: manager.id,
        approvedById: finance.id,
        approvedAt: new Date("2025-10-02"),
      },
      {
        id: "exp_1_4",
        organizationId: org.id,
        projectId: project1.id,
        budgetCategoryId: bc1_signage.id,
        vendorId: vendorSignage.id,
        description: "Directional signage, entrance banner, and floor plan boards",
        amountCents: 22000000,
        date: new Date("2025-09-20"),
        status: "APPROVED",
        submittedById: member.id,
        approvedById: finance.id,
        approvedAt: new Date("2025-09-21"),
      },
      {
        id: "exp_1_5",
        organizationId: org.id,
        projectId: project1.id,
        budgetCategoryId: bc1_photo.id,
        vendorId: vendorPhoto.id,
        description: "Event photography (2 days) and edited deliverables",
        amountCents: 14000000,
        date: new Date("2025-10-05"),
        status: "REIMBURSED",
        submittedById: admin.id,
        approvedById: finance.id,
        approvedAt: new Date("2025-10-08"),
      },
    ],
  });

  // Project 1 - invoice (fully paid)
  const inv1 = await prisma.invoice.create({
    data: {
      id: "inv_1",
      organizationId: org.id,
      projectId: project1.id,
      invoiceNumber: "KDS-001",
      clientName: "Assembly Nairobi",
      clientEmail: "finance@assembly.co.ke",
      clientAddress: "The Alchemist, Westlands, Nairobi",
      issueDate: new Date("2025-10-10"),
      dueDate: new Date("2025-11-09"),
      paymentTerms: "NET_30",
      status: "PAID",
      subtotalCents: 215000000,
      taxRateBasisPoints: 1600,
      taxAmountCents: 34400000,
      totalCents: 249400000,
      balanceDueCents: 0,
      sentAt: new Date("2025-10-10"),
      viewedAt: new Date("2025-10-11"),
      paidAt: new Date("2025-10-28"),
      notes: "Final invoice for Assembly event design and logistics",
    },
  });

  await prisma.invoiceLineItem.createMany({
    data: [
      {
        id: "ili_1_1",
        invoiceId: inv1.id,
        description: "Event spatial design and concept development",
        quantityThousandths: 1000,
        unitPriceCents: 75000000,
        amountCents: 75000000,
        sortOrder: 0,
      },
      {
        id: "ili_1_2",
        invoiceId: inv1.id,
        description: "Production management and vendor coordination",
        quantityThousandths: 1000,
        unitPriceCents: 50000000,
        amountCents: 50000000,
        sortOrder: 1,
      },
      {
        id: "ili_1_3",
        invoiceId: inv1.id,
        description: "On-site event coordination (2 days)",
        quantityThousandths: 2000,
        unitPriceCents: 25000000,
        amountCents: 50000000,
        sortOrder: 2,
      },
      {
        id: "ili_1_4",
        invoiceId: inv1.id,
        description: "Branded environment elements and installation",
        quantityThousandths: 1000,
        unitPriceCents: 40000000,
        amountCents: 40000000,
        sortOrder: 3,
      },
    ],
  });

  await prisma.payment.create({
    data: {
      id: "pay_1_1",
      invoiceId: inv1.id,
      amountCents: 249400000,
      paymentDate: new Date("2025-10-28"),
      paymentMethod: "bank_transfer",
      reference: "TXN-ASM-2025-1028",
      notes: "Full payment received",
    },
  });

  // Project 1 - comments
  await prisma.comment.createMany({
    data: [
      {
        id: "comment_1_1",
        projectId: project1.id,
        authorId: admin.id,
        content:
          "Site walkthrough completed. The courtyard works well for the main gathering space. Patterned rugs will define the zones effectively.",
        createdAt: new Date("2025-09-02T14:30:00Z"),
      },
      {
        id: "comment_1_2",
        projectId: project1.id,
        authorId: manager.id,
        content:
          "Schedule wall graphics are at the printer. Turnaround is 5 business days. We should have them by the 20th.",
        createdAt: new Date("2025-09-15T09:00:00Z"),
      },
      {
        id: "comment_1_3",
        projectId: project1.id,
        authorId: finance.id,
        content:
          "All vendor invoices processed and reconciled. Project came in under budget by KES 370,000.",
        createdAt: new Date("2025-10-20T11:00:00Z"),
      },
    ],
  });

  // ================================================================
  // PROJECT 2: adidas x assembly design lab (ACTIVE)
  //
  // Demonstrates: active in-progress project with mixed task
  // statuses, partial budget spend, outstanding invoices, and
  // ongoing vendor coordination.
  // ================================================================
  const project2 = await prisma.project.create({
    data: {
      id: "proj_adidas_lab",
      organizationId: org.id,
      name: "adidas x assembly design lab",
      description:
        "Collaborative design lab activation in partnership with adidas Originals at the Assembly venue. Features a screen printing workshop, custom apparel station, brand installation wall, and creative lounge space.",
      type: "EXHIBITION",
      status: "ACTIVE",
      clientName: "adidas East Africa",
      clientEmail: "activations@adidas.co.ke",
      clientPhone: "+254 700 200 200",
      clientAddress: "adidas East Africa, Westlands, Nairobi",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-03-15"),
    },
  });

  // Project 2 - teams
  await prisma.projectTeam.createMany({
    data: [
      { id: "pt_2a", projectId: project2.id, teamId: designTeam.id },
      { id: "pt_2b", projectId: project2.id, teamId: fabricationTeam.id },
    ],
  });

  // Project 2 - vendors
  await prisma.projectVendor.createMany({
    data: [
      { id: "pv_2a", projectId: project2.id, vendorId: vendorFab.id },
      { id: "pv_2b", projectId: project2.id, vendorId: vendorPrint.id },
      { id: "pv_2c", projectId: project2.id, vendorId: vendorPhoto.id },
      { id: "pv_2d", projectId: project2.id, vendorId: vendorSignage.id },
    ],
  });

  // Project 2 - milestones and tasks (mixed progress)
  const ms2_1 = await prisma.milestone.create({
    data: {
      id: "ms_2_design",
      projectId: project2.id,
      name: "Creative direction & design",
      description: "Develop visual identity and spatial design for the design lab",
      sortOrder: 0,
      dueDate: new Date("2026-01-31"),
      completedAt: new Date("2026-01-29"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_2_1",
        milestoneId: ms2_1.id,
        title: "Research adidas Originals brand guidelines and trefoil identity",
        status: "DONE",
        priority: "HIGH",
        assigneeId: admin.id,
        creatorId: admin.id,
        dueDate: new Date("2026-01-20"),
        completedAt: new Date("2026-01-19"),
        sortOrder: 0,
      },
      {
        id: "task_2_2",
        milestoneId: ms2_1.id,
        title: "Design lab spatial layout and zone mapping",
        status: "DONE",
        priority: "HIGH",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2026-01-25"),
        completedAt: new Date("2026-01-24"),
        sortOrder: 1,
      },
      {
        id: "task_2_3",
        milestoneId: ms2_1.id,
        title: "Create mood boards for workshop and lounge areas",
        status: "DONE",
        priority: "MEDIUM",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2026-01-28"),
        completedAt: new Date("2026-01-27"),
        sortOrder: 2,
      },
    ],
  });

  const ms2_2 = await prisma.milestone.create({
    data: {
      id: "ms_2_build",
      projectId: project2.id,
      name: "Build & fabrication",
      description: "Screen print station setup, brand wall construction, and furniture sourcing",
      sortOrder: 1,
      dueDate: new Date("2026-02-15"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_2_4",
        milestoneId: ms2_2.id,
        title: "Fabricate custom screen printing station",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2026-02-08"),
        sortOrder: 0,
      },
      {
        id: "task_2_5",
        milestoneId: ms2_2.id,
        title: "Construct trefoil brand wall (large-scale logo installation)",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: member.id,
        creatorId: manager.id,
        dueDate: new Date("2026-02-10"),
        sortOrder: 1,
      },
      {
        id: "task_2_6",
        milestoneId: ms2_2.id,
        title: "Source vintage leather sofa and lounge furniture",
        status: "DONE",
        priority: "MEDIUM",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2026-02-05"),
        completedAt: new Date("2026-02-04"),
        sortOrder: 2,
      },
      {
        id: "task_2_7",
        milestoneId: ms2_2.id,
        title: "Print custom t-shirt blanks with adidas co-branding",
        status: "REVIEW",
        priority: "HIGH",
        assigneeId: member.id,
        creatorId: manager.id,
        dueDate: new Date("2026-02-12"),
        sortOrder: 3,
      },
      {
        id: "task_2_8",
        milestoneId: ms2_2.id,
        title: "Install patterned rugs and floor treatment",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2026-02-14"),
        sortOrder: 4,
      },
    ],
  });

  const ms2_3 = await prisma.milestone.create({
    data: {
      id: "ms_2_launch",
      projectId: project2.id,
      name: "Lab launch & activation",
      description: "Opening event, workshop facilitation, and content capture",
      sortOrder: 2,
      dueDate: new Date("2026-03-01"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_2_9",
        milestoneId: ms2_3.id,
        title: "Coordinate launch event guest list and invitations",
        status: "TODO",
        priority: "HIGH",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2026-02-20"),
        sortOrder: 0,
      },
      {
        id: "task_2_10",
        milestoneId: ms2_3.id,
        title: "Brief photographer and videographer for content capture",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: admin.id,
        creatorId: admin.id,
        dueDate: new Date("2026-02-22"),
        sortOrder: 1,
      },
      {
        id: "task_2_11",
        milestoneId: ms2_3.id,
        title: "Prepare workshop materials (screens, inks, stencils)",
        status: "TODO",
        priority: "HIGH",
        assigneeId: member.id,
        creatorId: manager.id,
        dueDate: new Date("2026-02-25"),
        sortOrder: 2,
      },
    ],
  });

  // Project 2 - budget (KES 2,400,000 = 240000000 cents)
  const budget2 = await prisma.budget.create({
    data: {
      id: "budget_2",
      projectId: project2.id,
      totalAmountCents: 240000000,
      approvedAt: new Date("2026-01-16"),
      approvedById: admin.id,
      notes: "Approved budget includes adidas co-funding contribution",
    },
  });

  const bc2_fab = await prisma.budgetCategory.create({
    data: {
      id: "bc_2_fab",
      budgetId: budget2.id,
      name: "Fabrication & build",
      allocatedCents: 80000000,
      sortOrder: 0,
    },
  });

  const bc2_print = await prisma.budgetCategory.create({
    data: {
      id: "bc_2_print",
      budgetId: budget2.id,
      name: "Print & apparel production",
      allocatedCents: 55000000,
      sortOrder: 1,
    },
  });

  const bc2_furniture = await prisma.budgetCategory.create({
    data: {
      id: "bc_2_furniture",
      budgetId: budget2.id,
      name: "Furniture & fixtures",
      allocatedCents: 35000000,
      sortOrder: 2,
    },
  });

  const bc2_signage = await prisma.budgetCategory.create({
    data: {
      id: "bc_2_signage",
      budgetId: budget2.id,
      name: "Signage & branding",
      allocatedCents: 30000000,
      sortOrder: 3,
    },
  });

  const bc2_photo = await prisma.budgetCategory.create({
    data: {
      id: "bc_2_photo",
      budgetId: budget2.id,
      name: "Photography & content",
      allocatedCents: 20000000,
      sortOrder: 4,
    },
  });

  await prisma.budgetCategory.create({
    data: {
      id: "bc_2_contingency",
      budgetId: budget2.id,
      name: "Contingency",
      allocatedCents: 20000000,
      sortOrder: 5,
    },
  });

  // Project 2 - expenses (mixed statuses showing active workflow)
  await prisma.expense.createMany({
    data: [
      {
        id: "exp_2_1",
        organizationId: org.id,
        projectId: project2.id,
        budgetCategoryId: bc2_fab.id,
        vendorId: vendorFab.id,
        description: "Screen printing station - steel frame fabrication",
        amountCents: 35000000,
        date: new Date("2026-01-25"),
        status: "APPROVED",
        submittedById: manager.id,
        approvedById: finance.id,
        approvedAt: new Date("2026-01-26"),
      },
      {
        id: "exp_2_2",
        organizationId: org.id,
        projectId: project2.id,
        budgetCategoryId: bc2_print.id,
        vendorId: vendorPrint.id,
        description: "Custom blank t-shirts (200 units, black and white)",
        amountCents: 28000000,
        date: new Date("2026-01-30"),
        status: "APPROVED",
        submittedById: member.id,
        approvedById: finance.id,
        approvedAt: new Date("2026-01-31"),
      },
      {
        id: "exp_2_3",
        organizationId: org.id,
        projectId: project2.id,
        budgetCategoryId: bc2_furniture.id,
        vendorId: vendorFurniture.id,
        description: "Vintage leather sofa and wooden side tables for lounge area",
        amountCents: 32000000,
        date: new Date("2026-02-03"),
        status: "SUBMITTED",
        submittedById: manager.id,
      },
      {
        id: "exp_2_4",
        organizationId: org.id,
        projectId: project2.id,
        budgetCategoryId: bc2_signage.id,
        vendorId: vendorSignage.id,
        description: "Large-scale trefoil logo vinyl cut and brand wall elements",
        amountCents: 18000000,
        date: new Date("2026-02-04"),
        status: "DRAFT",
        submittedById: member.id,
        notes: "Waiting for final artwork approval from adidas brand team",
      },
    ],
  });

  // Project 2 - invoice (partially paid, showing milestone billing)
  const inv2 = await prisma.invoice.create({
    data: {
      id: "inv_2",
      organizationId: org.id,
      projectId: project2.id,
      invoiceNumber: "KDS-002",
      clientName: "adidas East Africa",
      clientEmail: "accounts@adidas.co.ke",
      clientAddress: "adidas East Africa, Westlands, Nairobi",
      issueDate: new Date("2026-01-20"),
      dueDate: new Date("2026-02-19"),
      paymentTerms: "MILESTONE",
      status: "PARTIALLY_PAID",
      subtotalCents: 280000000,
      taxRateBasisPoints: 1600,
      taxAmountCents: 44800000,
      totalCents: 324800000,
      balanceDueCents: 162400000,
      sentAt: new Date("2026-01-20"),
      viewedAt: new Date("2026-01-21"),
      notes: "Milestone-based billing: 50% on design approval, 50% on lab launch",
    },
  });

  await prisma.invoiceLineItem.createMany({
    data: [
      {
        id: "ili_2_1",
        invoiceId: inv2.id,
        description: "Design lab creative direction and spatial design",
        quantityThousandths: 1000,
        unitPriceCents: 90000000,
        amountCents: 90000000,
        sortOrder: 0,
      },
      {
        id: "ili_2_2",
        invoiceId: inv2.id,
        description: "Fabrication and build (screen print station, brand wall)",
        quantityThousandths: 1000,
        unitPriceCents: 85000000,
        amountCents: 85000000,
        sortOrder: 1,
      },
      {
        id: "ili_2_3",
        invoiceId: inv2.id,
        description: "Workshop facilitation and activation management",
        quantityThousandths: 1000,
        unitPriceCents: 60000000,
        amountCents: 60000000,
        sortOrder: 2,
      },
      {
        id: "ili_2_4",
        invoiceId: inv2.id,
        description: "Content production and documentation",
        quantityThousandths: 1000,
        unitPriceCents: 45000000,
        amountCents: 45000000,
        sortOrder: 3,
      },
    ],
  });

  await prisma.payment.create({
    data: {
      id: "pay_2_1",
      invoiceId: inv2.id,
      amountCents: 162400000,
      paymentDate: new Date("2026-01-30"),
      paymentMethod: "bank_transfer",
      reference: "TXN-ADI-2026-0130",
      notes: "Milestone 1 payment - design phase completion (50%)",
    },
  });

  // Project 2 - comments
  await prisma.comment.createMany({
    data: [
      {
        id: "comment_2_1",
        projectId: project2.id,
        authorId: admin.id,
        content:
          "adidas brand team approved the spatial layout and mood boards. Moving to fabrication phase. The trefoil wall piece needs to be at minimum 2m tall for visual impact.",
        createdAt: new Date("2026-01-29T16:00:00Z"),
      },
      {
        id: "comment_2_2",
        projectId: project2.id,
        authorId: manager.id,
        content:
          "Screen printing station frame is with the fabricator. Expected delivery Feb 8. We need to coordinate the vinyl graphics timeline with SignCraft to align.",
        createdAt: new Date("2026-02-03T10:30:00Z"),
      },
      {
        id: "comment_2_3",
        projectId: project2.id,
        authorId: member.id,
        content:
          "T-shirt blanks arrived - 100 black, 100 white. Quality is good. Need to finalize the screen print designs with the adidas team before we start production.",
        createdAt: new Date("2026-02-05T14:15:00Z"),
      },
    ],
  });

  // ================================================================
  // PROJECT 3: mid century style bar & boutique design & build
  // for kaliworks (DRAFT)
  //
  // Demonstrates: early-stage project in draft with budget
  // planning, no expenses yet, draft invoice for deposit,
  // and initial task breakdown.
  // ================================================================
  const project3 = await prisma.project.create({
    data: {
      id: "proj_kaliworks",
      organizationId: org.id,
      name: "mid century style bar & boutique design & build for kaliworks",
      description:
        "Full interior design and build-out for Kaliworks, a mid-century modern style bar and boutique space. Includes arched ceiling detail work, Portuguese-inspired tile bar front, custom timber furniture, brass fixture sourcing, and full fit-out.",
      type: "INTERIOR_DESIGN",
      status: "DRAFT",
      clientName: "Kaliworks Ltd",
      clientEmail: "hello@kaliworks.co.ke",
      clientPhone: "+254 700 300 300",
      clientAddress: "Industrial Area, Nairobi",
      startDate: new Date("2026-02-15"),
      endDate: new Date("2026-06-30"),
    },
  });

  // Project 3 - teams
  await prisma.projectTeam.createMany({
    data: [
      { id: "pt_3a", projectId: project3.id, teamId: designTeam.id },
      { id: "pt_3b", projectId: project3.id, teamId: fabricationTeam.id },
    ],
  });

  // Project 3 - vendors
  await prisma.projectVendor.createMany({
    data: [
      { id: "pv_3a", projectId: project3.id, vendorId: vendorFab.id },
      { id: "pv_3b", projectId: project3.id, vendorId: vendorFurniture.id },
      { id: "pv_3c", projectId: project3.id, vendorId: vendorLighting.id },
    ],
  });

  // Project 3 - milestones and tasks (initial planning, mostly TODO)
  const ms3_1 = await prisma.milestone.create({
    data: {
      id: "ms_3_design",
      projectId: project3.id,
      name: "Design development & client approval",
      description:
        "Concept refinement, material selection, and client sign-off on design direction",
      sortOrder: 0,
      dueDate: new Date("2026-03-15"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_3_1",
        milestoneId: ms3_1.id,
        title: "Site survey and existing conditions documentation",
        status: "TODO",
        priority: "HIGH",
        assigneeId: admin.id,
        creatorId: admin.id,
        dueDate: new Date("2026-02-20"),
        sortOrder: 0,
      },
      {
        id: "task_3_2",
        milestoneId: ms3_1.id,
        title: "Develop mid-century design concept and material palette",
        description:
          "Focus on Portuguese-inspired tile patterns, warm timber tones, brass accents, and arched architectural details",
        status: "TODO",
        priority: "HIGH",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2026-02-28"),
        sortOrder: 1,
      },
      {
        id: "task_3_3",
        milestoneId: ms3_1.id,
        title: "Source Portuguese ceramic tile samples for bar front",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2026-03-05"),
        sortOrder: 2,
      },
      {
        id: "task_3_4",
        milestoneId: ms3_1.id,
        title: "Present design package to client for approval",
        status: "TODO",
        priority: "HIGH",
        assigneeId: admin.id,
        creatorId: admin.id,
        dueDate: new Date("2026-03-15"),
        sortOrder: 3,
      },
    ],
  });

  const ms3_2 = await prisma.milestone.create({
    data: {
      id: "ms_3_procurement",
      projectId: project3.id,
      name: "Procurement & custom fabrication",
      description: "Order materials, begin custom furniture fabrication and fixture sourcing",
      sortOrder: 1,
      dueDate: new Date("2026-04-30"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_3_5",
        milestoneId: ms3_2.id,
        title: "Order Portuguese ceramic tiles for bar front and floor accent",
        status: "TODO",
        priority: "HIGH",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2026-03-20"),
        sortOrder: 0,
      },
      {
        id: "task_3_6",
        milestoneId: ms3_2.id,
        title: "Commission custom timber tables and bench seating",
        status: "TODO",
        priority: "HIGH",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2026-03-25"),
        sortOrder: 1,
      },
      {
        id: "task_3_7",
        milestoneId: ms3_2.id,
        title: "Source brass light fixtures and wall sconces",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2026-04-05"),
        sortOrder: 2,
      },
      {
        id: "task_3_8",
        milestoneId: ms3_2.id,
        title: "Fabricate custom bar counter with tile inlay",
        status: "TODO",
        priority: "HIGH",
        assigneeId: manager.id,
        creatorId: manager.id,
        dueDate: new Date("2026-04-25"),
        sortOrder: 3,
      },
    ],
  });

  const ms3_3 = await prisma.milestone.create({
    data: {
      id: "ms_3_install",
      projectId: project3.id,
      name: "Installation & fit-out",
      description: "On-site build, installation, and final styling",
      sortOrder: 2,
      dueDate: new Date("2026-06-15"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task_3_9",
        milestoneId: ms3_3.id,
        title: "Arch ceiling detail construction and finishing",
        status: "TODO",
        priority: "HIGH",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2026-05-15"),
        sortOrder: 0,
      },
      {
        id: "task_3_10",
        milestoneId: ms3_3.id,
        title: "Tile installation (bar front and floor accents)",
        status: "TODO",
        priority: "HIGH",
        assigneeId: manager.id,
        creatorId: admin.id,
        dueDate: new Date("2026-05-25"),
        sortOrder: 1,
      },
      {
        id: "task_3_11",
        milestoneId: ms3_3.id,
        title: "Furniture placement and lighting installation",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: member.id,
        creatorId: admin.id,
        dueDate: new Date("2026-06-05"),
        sortOrder: 2,
      },
      {
        id: "task_3_12",
        milestoneId: ms3_3.id,
        title: "Final styling, accessorizing, and client walkthrough",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: admin.id,
        creatorId: admin.id,
        dueDate: new Date("2026-06-15"),
        sortOrder: 3,
      },
    ],
  });

  // Project 3 - budget (KES 4,200,000 = 420000000 cents)
  const budget3 = await prisma.budget.create({
    data: {
      id: "budget_3",
      projectId: project3.id,
      totalAmountCents: 420000000,
      notes: "Preliminary budget - pending client approval before project activation",
    },
  });

  await prisma.budgetCategory.createMany({
    data: [
      {
        id: "bc_3_tile",
        budgetId: budget3.id,
        name: "Ceramic tiles and floor materials",
        allocatedCents: 85000000,
        sortOrder: 0,
      },
      {
        id: "bc_3_furniture",
        budgetId: budget3.id,
        name: "Custom furniture and seating",
        allocatedCents: 95000000,
        sortOrder: 1,
      },
      {
        id: "bc_3_lighting",
        budgetId: budget3.id,
        name: "Lighting and electrical fixtures",
        allocatedCents: 45000000,
        sortOrder: 2,
      },
      {
        id: "bc_3_build",
        budgetId: budget3.id,
        name: "Construction and build-out",
        allocatedCents: 120000000,
        sortOrder: 3,
      },
      {
        id: "bc_3_design",
        budgetId: budget3.id,
        name: "Design fees",
        allocatedCents: 50000000,
        sortOrder: 4,
      },
      {
        id: "bc_3_contingency",
        budgetId: budget3.id,
        name: "Contingency",
        allocatedCents: 25000000,
        sortOrder: 5,
      },
    ],
  });

  // Project 3 - draft invoice for deposit (not yet sent)
  await prisma.invoice.create({
    data: {
      id: "inv_3",
      organizationId: org.id,
      projectId: project3.id,
      invoiceNumber: "KDS-003",
      clientName: "Kaliworks Ltd",
      clientEmail: "accounts@kaliworks.co.ke",
      clientAddress: "Industrial Area, Nairobi",
      issueDate: new Date("2026-02-10"),
      dueDate: new Date("2026-02-24"),
      paymentTerms: "DUE_ON_RECEIPT",
      status: "DRAFT",
      subtotalCents: 150000000,
      taxRateBasisPoints: 1600,
      taxAmountCents: 24000000,
      totalCents: 174000000,
      balanceDueCents: 174000000,
      notes: "Deposit invoice - 30% of estimated project value. To be sent upon client sign-off.",
    },
  });

  await prisma.invoiceLineItem.createMany({
    data: [
      {
        id: "ili_3_1",
        invoiceId: "inv_3",
        description: "Design development deposit (30% of design fees)",
        quantityThousandths: 1000,
        unitPriceCents: 50000000,
        amountCents: 50000000,
        sortOrder: 0,
      },
      {
        id: "ili_3_2",
        invoiceId: "inv_3",
        description: "Material procurement deposit (advance for tile and timber orders)",
        quantityThousandths: 1000,
        unitPriceCents: 100000000,
        amountCents: 100000000,
        sortOrder: 1,
      },
    ],
  });

  // Project 3 - comments
  await prisma.comment.createMany({
    data: [
      {
        id: "comment_3_1",
        projectId: project3.id,
        authorId: admin.id,
        content:
          "Met with the Kaliworks team on-site. The space has great bones - the arched ceiling is original and sets the tone for the mid-century direction. Need to work around the existing plumbing layout for the bar position.",
        createdAt: new Date("2026-02-01T15:00:00Z"),
      },
      {
        id: "comment_3_2",
        projectId: project3.id,
        authorId: viewer.id,
        content:
          "Reviewing the initial budget breakdown. The ceramic tile allocation looks reasonable but we should get at least 3 quotes for the Portuguese imports to ensure competitive pricing.",
        createdAt: new Date("2026-02-04T09:30:00Z"),
      },
    ],
  });

  // ──────────────────────────────────────
  // Activity Logs (sample entries across projects)
  // ──────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      {
        id: "al_1",
        organizationId: org.id,
        projectId: project1.id,
        userId: admin.id,
        action: "project.created",
        entityType: "Project",
        entityId: project1.id,
        createdAt: new Date("2025-09-01T09:00:00Z"),
      },
      {
        id: "al_2",
        organizationId: org.id,
        projectId: project1.id,
        userId: admin.id,
        action: "project.status_changed",
        entityType: "Project",
        entityId: project1.id,
        metadata: { from: "DRAFT", to: "ACTIVE" },
        createdAt: new Date("2025-09-01T09:05:00Z"),
      },
      {
        id: "al_3",
        organizationId: org.id,
        projectId: project1.id,
        userId: finance.id,
        action: "expense.approved",
        entityType: "Expense",
        entityId: "exp_1_1",
        createdAt: new Date("2025-09-16T10:00:00Z"),
      },
      {
        id: "al_4",
        organizationId: org.id,
        projectId: project1.id,
        userId: admin.id,
        action: "project.status_changed",
        entityType: "Project",
        entityId: project1.id,
        metadata: { from: "ACTIVE", to: "COMPLETED" },
        createdAt: new Date("2025-10-15T17:00:00Z"),
      },
      {
        id: "al_5",
        organizationId: org.id,
        projectId: project2.id,
        userId: admin.id,
        action: "project.created",
        entityType: "Project",
        entityId: project2.id,
        createdAt: new Date("2026-01-15T08:00:00Z"),
      },
      {
        id: "al_6",
        organizationId: org.id,
        projectId: project2.id,
        userId: admin.id,
        action: "project.status_changed",
        entityType: "Project",
        entityId: project2.id,
        metadata: { from: "DRAFT", to: "ACTIVE" },
        createdAt: new Date("2026-01-15T08:10:00Z"),
      },
      {
        id: "al_7",
        organizationId: org.id,
        projectId: project2.id,
        userId: finance.id,
        action: "payment.recorded",
        entityType: "Payment",
        entityId: "pay_2_1",
        metadata: { amountCents: 162400000, invoiceNumber: "KDS-002" },
        createdAt: new Date("2026-01-30T14:00:00Z"),
      },
      {
        id: "al_8",
        organizationId: org.id,
        projectId: project3.id,
        userId: admin.id,
        action: "project.created",
        entityType: "Project",
        entityId: project3.id,
        createdAt: new Date("2026-02-01T10:00:00Z"),
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("");
  console.log("Organization: Kilibasi Design Studio");
  console.log("Users created:");
  console.log("  - Amani Ochieng (ADMIN) - amani@kilibasi.co.ke");
  console.log("  - Fatima Wanjiku (MANAGER) - fatima@kilibasi.co.ke");
  console.log("  - Kwame Mwangi (FINANCE) - kwame@kilibasi.co.ke");
  console.log("  - Zuri Kamau (MEMBER) - zuri@kilibasi.co.ke");
  console.log("  - Jabari Otieno (VIEWER) - jabari@kilibasi.co.ke");
  console.log("  (all passwords: password123)");
  console.log("");
  console.log("Projects created:");
  console.log("  1. assembly event design & logistics (COMPLETED / EXPERIENTIAL)");
  console.log("  2. adidas x assembly design lab (ACTIVE / EXHIBITION)");
  console.log("  3. mid century style bar & boutique design & build for kaliworks (DRAFT / INTERIOR_DESIGN)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
