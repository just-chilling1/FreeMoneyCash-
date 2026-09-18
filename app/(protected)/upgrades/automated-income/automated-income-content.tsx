"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, TrendingUp, CheckCircle2, ExternalLink, Clock, Users, Play, Sparkles, Search, Copy } from "lucide-react"
import Link from "next/link"
import { vimeoPlayerUrl } from "@/lib/training-videos"
import { cn } from "@/lib/utils"

const TRAINING_VIMEO_ID = "1134298104"

function completedStorageKey(userId: string) {
  return `automated-income-completed:${userId}`
}

function parseTrafficMidpoint(range: string) {
  const matches = range.match(/\d+/g)
  if (!matches || matches.length < 2) return 0
  return (Number(matches[0]) + Number(matches[1])) / 2
}

function parseMinutes(time: string) {
  return Number(time.match(/\d+/)?.[0] ?? 0)
}

interface TrafficSource {
  id: string
  name: string
  url: string
  category: string
  niche: string
  trafficPotential: string
  timeToComplete: string
  difficulty: "Easy" | "Medium"
  instructions: string[]
  submissionDescription: string
}

const trafficSources: TrafficSource[] = [
  // Weight Loss Sources (15 total)
  {
    id: "wl1",
    name: "MyFitnessPal Community",
    url: "https://community.myfitnesspal.com",
    category: "Forum",
    niche: "Weight Loss",
    trafficPotential: "200-500 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Go to community.myfitnesspal.com and create a free account",
      "Complete your profile with a photo and bio",
      "Go to Settings → Signature and add your link with the description below",
      "Make 3-5 helpful posts in the 'Success Stories' or 'Motivation' sections",
      "Your signature with your link appears on every post automatically",
      "Continue posting 2-3 times per week for ongoing traffic",
    ],
    submissionDescription:
      "🎯 Struggling to lose weight? I found this system that helped me drop 30 pounds: [YOUR_LINK]",
  },
  {
    id: "wl2",
    name: "SparkPeople Forums",
    url: "https://www.sparkpeople.com/mypage_public_journal_individual.asp",
    category: "Forum",
    niche: "Weight Loss",
    trafficPotential: "150-400 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create free account at sparkpeople.com",
      "Set up your profile and add a profile picture",
      "Go to your profile settings and add the description below to your 'About Me'",
      "Join 3-5 active groups related to weight loss",
      "Post helpful comments and share your journey",
      "Your profile link is visible on all your posts and comments",
    ],
    submissionDescription: "My weight loss journey: [YOUR_LINK] - Check out what's working for me!",
  },
  {
    id: "wl3",
    name: "3FatChicks Forum",
    url: "https://www.3fatchicks.com/forum/",
    category: "Forum",
    niche: "Weight Loss",
    trafficPotential: "100-300 visitors/month",
    timeToComplete: "8 minutes",
    difficulty: "Easy",
    instructions: [
      "Register at 3fatchicks.com/forum",
      "Complete your profile information",
      "Add your link to your signature in profile settings",
      "Post in the 'Success Stories' section sharing your progress",
      "Reply to other members' posts with encouragement",
      "Your signature appears automatically on all posts",
    ],
    submissionDescription: "This is what finally worked for me: [YOUR_LINK]",
  },
  {
    id: "wl4",
    name: "LoseIt! Reddit Community",
    url: "https://www.reddit.com/r/loseit/",
    category: "Social",
    niche: "Weight Loss",
    trafficPotential: "300-800 visitors/month",
    timeToComplete: "5 minutes",
    difficulty: "Easy",
    instructions: [
      "Create a Reddit account if you don't have one",
      "Join r/loseit subreddit",
      "Read the community rules carefully",
      "Post a success story or progress update (must be genuine and helpful)",
      "In your post, naturally mention your link as a resource that helped you",
      "Engage with comments on your post",
    ],
    submissionDescription:
      "🎯 Struggling to lose weight? I found this system that helped me drop 30 pounds: [YOUR_LINK]",
  },
  {
    id: "wl5",
    name: "Weight Loss Buddy",
    url: "https://www.weightlossbuddy.com",
    category: "Directory",
    niche: "Weight Loss",
    trafficPotential: "80-200 visitors/month",
    timeToComplete: "7 minutes",
    difficulty: "Easy",
    instructions: [
      "Go to weightlossbuddy.com",
      "Click 'Add Your Site' or 'Submit Resource'",
      "Fill out the submission form with your page details",
      "Use the description provided below",
      "Add relevant tags: weight loss, diet, fitness",
      "Submit and wait for approval (usually 24-48 hours)",
    ],
    submissionDescription:
      "Proven weight loss system that helped thousands lose 20-50 pounds. Step-by-step guide with meal plans and workouts. [YOUR_LINK]",
  },
  {
    id: "wl6",
    name: "r/WeightLossAdvice",
    url: "https://www.reddit.com/r/WeightLossAdvice/",
    category: "Social",
    niche: "Weight Loss",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "6 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/WeightLossAdvice on Reddit",
      "Read posting guidelines",
      "Share your weight loss success story",
      "Include your link as a helpful resource",
      "Answer questions in comments",
      "Post monthly updates",
    ],
    submissionDescription: "My weight loss transformation guide: [YOUR_LINK] - Lost 40 pounds in 12 weeks!",
  },
  {
    id: "wl7",
    name: "Calorie Count Forum",
    url: "https://www.caloriecount.com/forums",
    category: "Forum",
    niche: "Weight Loss",
    trafficPotential: "120-350 visitors/month",
    timeToComplete: "9 minutes",
    difficulty: "Easy",
    instructions: [
      "Register at caloriecount.com",
      "Complete your weight loss profile",
      "Add signature with your link",
      "Post in diet and nutrition sections",
      "Share meal plans and tips",
      "Signature shows on all posts",
    ],
    submissionDescription: "Complete weight loss guide with meal plans: [YOUR_LINK]",
  },
  {
    id: "wl8",
    name: "Weight Loss Facebook Groups",
    url: "https://www.facebook.com/groups",
    category: "Social",
    niche: "Weight Loss",
    trafficPotential: "250-700 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Search Facebook for 'weight loss support groups'",
      "Join 5-10 active groups with 10K+ members",
      "Read each group's rules about posting links",
      "Share your success story with before/after photos",
      "Include your link in the post (if allowed) or in comments",
      "Engage with other members' posts daily",
    ],
    submissionDescription: "My weight loss journey and the system that worked: [YOUR_LINK]",
  },
  {
    id: "wl9",
    name: "Quora Weight Loss Topics",
    url: "https://www.quora.com/topic/Weight-Loss",
    category: "Q&A",
    niche: "Weight Loss",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Quora account",
      "Follow weight loss topics",
      "Answer 5-10 questions about weight loss",
      "Include your link naturally in helpful answers",
      "Add credentials to your profile",
      "Answer new questions weekly",
    ],
    submissionDescription: "I lost 35 pounds using this proven system: [YOUR_LINK]",
  },
  {
    id: "wl10",
    name: "Pinterest Weight Loss Boards",
    url: "https://www.pinterest.com",
    category: "Social",
    niche: "Weight Loss",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Pinterest business account",
      "Create boards: 'Weight Loss Tips', 'Healthy Recipes', 'Workout Plans'",
      "Create 10-15 pins linking to your page",
      "Use eye-catching images with text overlays",
      "Join group boards related to weight loss",
      "Pin consistently 3-5 times per week",
    ],
    submissionDescription: "Complete Weight Loss System - Lose 20-50 Pounds: [YOUR_LINK]",
  },
  {
    id: "wl11",
    name: "Medium Weight Loss Publication",
    url: "https://medium.com",
    category: "Content",
    niche: "Weight Loss",
    trafficPotential: "150-500 visitors/month",
    timeToComplete: "20 minutes",
    difficulty: "Medium",
    instructions: [
      "Create Medium account",
      "Write a 1000+ word article about your weight loss journey",
      "Include your link naturally in the article",
      "Submit to weight loss publications",
      "Share on social media",
      "Write new articles monthly",
    ],
    submissionDescription: "How I Lost 40 Pounds in 90 Days: [YOUR_LINK]",
  },
  {
    id: "wl12",
    name: "LinkedIn Weight Loss Groups",
    url: "https://www.linkedin.com",
    category: "Social",
    niche: "Weight Loss",
    trafficPotential: "100-300 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Join LinkedIn groups about health and wellness",
      "Share professional insights about weight loss",
      "Post your success story",
      "Include your link in posts",
      "Engage with other members",
      "Post weekly updates",
    ],
    submissionDescription: "Professional weight loss system that works: [YOUR_LINK]",
  },
  {
    id: "wl13",
    name: "YouTube Weight Loss Community",
    url: "https://www.youtube.com",
    category: "Video",
    niche: "Weight Loss",
    trafficPotential: "200-800 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Medium",
    instructions: [
      "Create YouTube channel",
      "Comment on popular weight loss videos",
      "Add your link to channel description",
      "Create simple videos showing your results",
      "Link to your page in video descriptions",
      "Engage with comments",
    ],
    submissionDescription: "My complete weight loss system: [YOUR_LINK]",
  },
  {
    id: "wl14",
    name: "Instagram Weight Loss Community",
    url: "https://www.instagram.com",
    category: "Social",
    niche: "Weight Loss",
    trafficPotential: "300-1000 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Instagram account focused on weight loss",
      "Post before/after photos and progress updates",
      "Use hashtags: #weightloss #weightlossjourney #transformation",
      "Add your link to bio",
      "Engage with other weight loss accounts",
      "Post daily stories and updates",
    ],
    submissionDescription: "Link in bio - My weight loss system: [YOUR_LINK]",
  },
  {
    id: "wl15",
    name: "TikTok Weight Loss Community",
    url: "https://www.tiktok.com",
    category: "Video",
    niche: "Weight Loss",
    trafficPotential: "500-2000 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create TikTok account",
      "Post short videos about your weight loss journey",
      "Use trending sounds and hashtags",
      "Add link to bio",
      "Comment on popular weight loss videos",
      "Post 1-2 videos daily",
    ],
    submissionDescription: "Check my bio for the system I used: [YOUR_LINK]",
  },

  // Make Money Online Sources (15 total)
  {
    id: "mmo1",
    name: "Warrior Forum",
    url: "https://www.warriorforum.com",
    category: "Forum",
    niche: "Make Money Online",
    trafficPotential: "400-1000 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Medium",
    instructions: [
      "Create account at warriorforum.com",
      "Complete your profile with professional details",
      "Make 5 helpful posts in various sections (required before adding signature)",
      "Go to Settings → Edit Signature and add your link",
      "Continue posting valuable content in 'Main Internet Marketing Discussion'",
      "Your signature appears on all posts automatically",
    ],
    submissionDescription: "💰 How I went from $0 to $5K/month: [YOUR_LINK]",
  },
  {
    id: "mmo2",
    name: "BlackHatWorld Forum",
    url: "https://www.blackhatworld.com",
    category: "Forum",
    niche: "Make Money Online",
    trafficPotential: "500-1200 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Medium",
    instructions: [
      "Register at blackhatworld.com",
      "Verify your email and complete profile",
      "Read forum rules carefully",
      "Make 10 quality posts (forum requirement)",
      "Add signature with your link in profile settings",
      "Post in 'Making Money' section regularly",
    ],
    submissionDescription: "My proven system for online income: [YOUR_LINK] - Real results, no BS",
  },
  {
    id: "mmo3",
    name: "r/Entrepreneur Subreddit",
    url: "https://www.reddit.com/r/Entrepreneur/",
    category: "Social",
    niche: "Make Money Online",
    trafficPotential: "600-1500 visitors/month",
    timeToComplete: "8 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/Entrepreneur on Reddit",
      "Read community guidelines",
      "Post a valuable case study or success story",
      "Include your link naturally in the post as a resource",
      "Respond to all comments professionally",
      "Post updates monthly to maintain visibility",
    ],
    submissionDescription:
      "Case Study: How I built a $10K/month online business in 90 days - [YOUR_LINK] - Full breakdown inside",
  },
  {
    id: "mmo4",
    name: "Digital Point Forums",
    url: "https://forums.digitalpoint.com",
    category: "Forum",
    niche: "Make Money Online",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create account at forums.digitalpoint.com",
      "Set up profile with professional information",
      "Add signature with your link",
      "Post in 'Business' and 'Monetization' sections",
      "Share genuine insights and experiences",
      "Signature appears on all your posts",
    ],
    submissionDescription: "This changed my online business: [YOUR_LINK]",
  },
  {
    id: "mmo5",
    name: "Indie Hackers",
    url: "https://www.indiehackers.com",
    category: "Community",
    niche: "Make Money Online",
    trafficPotential: "300-800 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Sign up at indiehackers.com",
      "Create your profile and add your project",
      "Write a detailed post about your journey",
      "Include your link in your profile and posts",
      "Engage with other members' posts",
      "Share monthly updates on your progress",
    ],
    submissionDescription: "Building in public: My journey to $5K MRR - [YOUR_LINK]",
  },
  {
    id: "mmo6",
    name: "r/WorkOnline",
    url: "https://www.reddit.com/r/WorkOnline/",
    category: "Social",
    niche: "Make Money Online",
    trafficPotential: "400-1100 visitors/month",
    timeToComplete: "7 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/WorkOnline subreddit",
      "Read posting rules",
      "Share your online income success story",
      "Include your link as a resource",
      "Answer questions in comments",
      "Post monthly income reports",
    ],
    submissionDescription: "How I make $3K/month online: [YOUR_LINK] - Complete guide",
  },
  {
    id: "mmo7",
    name: "Quora Make Money Topics",
    url: "https://www.quora.com/topic/Making-Money",
    category: "Q&A",
    niche: "Make Money Online",
    trafficPotential: "500-1500 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Quora account",
      "Follow make money online topics",
      "Answer 10-15 questions about making money online",
      "Include your link in helpful, detailed answers",
      "Add credentials showing your success",
      "Answer new questions 2-3 times per week",
    ],
    submissionDescription: "I make $5K/month using this system: [YOUR_LINK]",
  },
  {
    id: "mmo8",
    name: "Medium Entrepreneurship Publication",
    url: "https://medium.com",
    category: "Content",
    niche: "Make Money Online",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "25 minutes",
    difficulty: "Medium",
    instructions: [
      "Create Medium account",
      "Write detailed article about your online business journey",
      "Include income screenshots and proof",
      "Add your link naturally in the article",
      "Submit to entrepreneurship publications",
      "Share on social media and engage with comments",
    ],
    submissionDescription: "From $0 to $10K/Month: My Complete Journey - [YOUR_LINK]",
  },
  {
    id: "mmo9",
    name: "LinkedIn Business Groups",
    url: "https://www.linkedin.com",
    category: "Social",
    niche: "Make Money Online",
    trafficPotential: "200-700 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Join LinkedIn groups about entrepreneurship and online business",
      "Share professional business insights",
      "Post case studies and success stories",
      "Include your link in posts",
      "Network with other entrepreneurs",
      "Post 2-3 times per week",
    ],
    submissionDescription: "My online business system: [YOUR_LINK] - $5K/month in 90 days",
  },
  {
    id: "mmo10",
    name: "Facebook Entrepreneur Groups",
    url: "https://www.facebook.com/groups",
    category: "Social",
    niche: "Make Money Online",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Search for 'make money online' and 'entrepreneur' groups",
      "Join 10-15 active groups with 20K+ members",
      "Read each group's posting rules",
      "Share income reports and success stories",
      "Include your link (if allowed)",
      "Engage daily with other posts",
    ],
    submissionDescription: "My complete online income system: [YOUR_LINK]",
  },
  {
    id: "mmo11",
    name: "YouTube Business Community",
    url: "https://www.youtube.com",
    category: "Video",
    niche: "Make Money Online",
    trafficPotential: "300-1000 visitors/month",
    timeToComplete: "20 minutes",
    difficulty: "Medium",
    instructions: [
      "Create YouTube channel about making money online",
      "Comment on popular business/entrepreneur videos",
      "Add your link to channel description",
      "Create videos showing your income results",
      "Link to your page in video descriptions",
      "Post weekly videos",
    ],
    submissionDescription: "My $5K/month online business system: [YOUR_LINK]",
  },
  {
    id: "mmo12",
    name: "Instagram Business Community",
    url: "https://www.instagram.com",
    category: "Social",
    niche: "Make Money Online",
    trafficPotential: "400-1300 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Instagram business account",
      "Post income screenshots and business tips",
      "Use hashtags: #makemoneyonline #entrepreneur #sidehustle",
      "Add your link to bio",
      "Engage with business community",
      "Post daily stories and reels",
    ],
    submissionDescription: "Link in bio - My online income system: [YOUR_LINK]",
  },
  {
    id: "mmo13",
    name: "TikTok Business Community",
    url: "https://www.tiktok.com",
    category: "Video",
    niche: "Make Money Online",
    trafficPotential: "600-2500 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create TikTok account focused on making money",
      "Post short videos about your online income",
      "Show income proof and results",
      "Use trending sounds and hashtags",
      "Add link to bio",
      "Post 2-3 videos daily",
    ],
    submissionDescription: "Check bio for my $5K/month system: [YOUR_LINK]",
  },
  {
    id: "mmo14",
    name: "Pinterest Business Boards",
    url: "https://www.pinterest.com",
    category: "Social",
    niche: "Make Money Online",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Pinterest business account",
      "Create boards: 'Make Money Online', 'Side Hustles', 'Passive Income'",
      "Create 15-20 pins linking to your page",
      "Use professional graphics with income claims",
      "Join group boards about making money",
      "Pin 5-7 times per week",
    ],
    submissionDescription: "Make $5K/Month Online - Complete System: [YOUR_LINK]",
  },
  {
    id: "mmo15",
    name: "Twitter/X Business Community",
    url: "https://twitter.com",
    category: "Social",
    niche: "Make Money Online",
    trafficPotential: "250-800 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Twitter/X account focused on online business",
      "Post daily income updates and business tips",
      "Use hashtags: #MakeMoneyOnline #Entrepreneur #SideHustle",
      "Add link to bio and pin tweet",
      "Engage with business community",
      "Tweet 3-5 times daily",
    ],
    submissionDescription: "My complete online income system: [YOUR_LINK]",
  },

  // Health & Fitness Sources (12 total)
  {
    id: "hf1",
    name: "Bodybuilding.com Forums",
    url: "https://forum.bodybuilding.com",
    category: "Forum",
    niche: "Health & Fitness",
    trafficPotential: "250-700 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Register at forum.bodybuilding.com",
      "Complete your fitness profile",
      "Add signature with your link in settings",
      "Post in 'Training' and 'Nutrition' sections",
      "Share your fitness journey and tips",
      "Signature shows on all posts automatically",
    ],
    submissionDescription: "My fitness transformation guide: [YOUR_LINK]",
  },
  {
    id: "hf2",
    name: "r/Fitness Subreddit",
    url: "https://www.reddit.com/r/Fitness/",
    category: "Social",
    niche: "Health & Fitness",
    trafficPotential: "400-1000 visitors/month",
    timeToComplete: "7 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/Fitness on Reddit",
      "Read posting guidelines carefully",
      "Post a transformation story or workout guide",
      "Include your link as a resource in the post",
      "Respond to comments and questions",
      "Post progress updates regularly",
    ],
    submissionDescription: "6-month transformation results using this program: [YOUR_LINK]",
  },
  {
    id: "hf3",
    name: "FitnessBlender Community",
    url: "https://www.fitnessblender.com/community",
    category: "Forum",
    niche: "Health & Fitness",
    trafficPotential: "150-400 visitors/month",
    timeToComplete: "8 minutes",
    difficulty: "Easy",
    instructions: [
      "Create account at fitnessblender.com",
      "Set up your fitness profile",
      "Join community discussions",
      "Add your link to profile bio",
      "Post workout updates and progress",
      "Engage with other members regularly",
    ],
    submissionDescription: "My complete fitness system: [YOUR_LINK]",
  },
  {
    id: "hf4",
    name: "r/BodyweightFitness",
    url: "https://www.reddit.com/r/bodyweightfitness/",
    category: "Social",
    niche: "Health & Fitness",
    trafficPotential: "300-800 visitors/month",
    timeToComplete: "7 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/bodyweightfitness",
      "Read community rules",
      "Post your workout routine and results",
      "Include your link as a resource",
      "Answer fitness questions",
      "Share monthly progress",
    ],
    submissionDescription: "My bodyweight fitness transformation: [YOUR_LINK]",
  },
  {
    id: "hf5",
    name: "Quora Fitness Topics",
    url: "https://www.quora.com/topic/Fitness",
    category: "Q&A",
    niche: "Health & Fitness",
    trafficPotential: "350-1000 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Quora account",
      "Follow fitness and health topics",
      "Answer 10-15 fitness questions",
      "Include your link in detailed answers",
      "Add fitness credentials to profile",
      "Answer new questions weekly",
    ],
    submissionDescription: "I transformed my body using this system: [YOUR_LINK]",
  },
  {
    id: "hf6",
    name: "Facebook Fitness Groups",
    url: "https://www.facebook.com/groups",
    category: "Social",
    niche: "Health & Fitness",
    trafficPotential: "350-1000 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Search for fitness and workout groups",
      "Join 10-15 active groups",
      "Read posting rules",
      "Share transformation photos and workout tips",
      "Include your link",
      "Engage daily",
    ],
    submissionDescription: "My complete fitness transformation system: [YOUR_LINK]",
  },
  {
    id: "hf7",
    name: "Instagram Fitness Community",
    url: "https://www.instagram.com",
    category: "Social",
    niche: "Health & Fitness",
    trafficPotential: "500-1500 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create fitness Instagram account",
      "Post workout videos and transformation photos",
      "Use hashtags: #fitness #workout #transformation",
      "Add link to bio",
      "Engage with fitness community",
      "Post daily content",
    ],
    submissionDescription: "Link in bio - My fitness system: [YOUR_LINK]",
  },
  {
    id: "hf8",
    name: "YouTube Fitness Community",
    url: "https://www.youtube.com",
    category: "Video",
    niche: "Health & Fitness",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "20 minutes",
    difficulty: "Medium",
    instructions: [
      "Create fitness YouTube channel",
      "Post workout videos and transformation updates",
      "Add link to video descriptions",
      "Comment on popular fitness videos",
      "Engage with subscribers",
      "Post weekly videos",
    ],
    submissionDescription: "My complete fitness program: [YOUR_LINK]",
  },
  {
    id: "hf9",
    name: "TikTok Fitness Community",
    url: "https://www.tiktok.com",
    category: "Video",
    niche: "Health & Fitness",
    trafficPotential: "600-2000 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create fitness TikTok account",
      "Post short workout videos",
      "Show transformation results",
      "Use trending fitness sounds",
      "Add link to bio",
      "Post 2-3 videos daily",
    ],
    submissionDescription: "Check bio for my fitness system: [YOUR_LINK]",
  },
  {
    id: "hf10",
    name: "Pinterest Fitness Boards",
    url: "https://www.pinterest.com",
    category: "Social",
    niche: "Health & Fitness",
    trafficPotential: "400-1100 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Pinterest account",
      "Create boards: 'Workout Plans', 'Fitness Tips', 'Transformation'",
      "Create 15-20 pins with workout graphics",
      "Link pins to your page",
      "Join fitness group boards",
      "Pin 5-7 times weekly",
    ],
    submissionDescription: "Complete Fitness Transformation System: [YOUR_LINK]",
  },
  {
    id: "hf11",
    name: "LinkedIn Health & Wellness Groups",
    url: "https://www.linkedin.com",
    category: "Social",
    niche: "Health & Fitness",
    trafficPotential: "150-450 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Join LinkedIn health and wellness groups",
      "Share professional fitness insights",
      "Post transformation stories",
      "Include your link",
      "Network with health professionals",
      "Post 2-3 times weekly",
    ],
    submissionDescription: "Professional fitness transformation system: [YOUR_LINK]",
  },
  {
    id: "hf12",
    name: "Medium Fitness Publication",
    url: "https://medium.com",
    category: "Content",
    niche: "Health & Fitness",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "25 minutes",
    difficulty: "Medium",
    instructions: [
      "Create Medium account",
      "Write detailed fitness transformation article",
      "Include workout plans and nutrition tips",
      "Add your link in article",
      "Submit to fitness publications",
      "Share on social media",
    ],
    submissionDescription: "My Complete Fitness Transformation Journey: [YOUR_LINK]",
  },

  // Tech & Gadgets Sources (12 total)
  {
    id: "tech1",
    name: "Product Hunt",
    url: "https://www.producthunt.com",
    category: "Directory",
    niche: "Tech & Gadgets",
    trafficPotential: "500-2000 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Medium",
    instructions: [
      "Create account at producthunt.com",
      "Build your profile with professional details",
      "Submit your product/resource",
      "Write compelling description using template below",
      "Add screenshots or demo video",
      "Engage with comments on launch day",
      "Share on social media for more upvotes",
    ],
    submissionDescription:
      "Revolutionary tech tool that saves 10+ hours per week. Simple setup, powerful results. [YOUR_LINK]",
  },
  {
    id: "tech2",
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    category: "Social",
    niche: "Tech & Gadgets",
    trafficPotential: "300-1500 visitors/month",
    timeToComplete: "5 minutes",
    difficulty: "Medium",
    instructions: [
      "Create account at news.ycombinator.com",
      "Build karma by commenting on posts (need 50+ karma to submit)",
      "Submit your link with clear, honest title",
      "Use description below in your submission",
      "Respond to all comments professionally",
      "Best posting time: 8-10 AM EST on weekdays",
    ],
    submissionDescription: "Show HN: Tool that [specific benefit] - [YOUR_LINK]",
  },
  {
    id: "tech3",
    name: "r/Technology Subreddit",
    url: "https://www.reddit.com/r/technology/",
    category: "Social",
    niche: "Tech & Gadgets",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "6 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/technology on Reddit",
      "Read subreddit rules",
      "Post tech news or resource related to your link",
      "Include your link in post or comments",
      "Engage with community discussions",
      "Post during peak hours (9 AM - 2 PM EST)",
    ],
    submissionDescription: "New tech solution for [problem]: [YOUR_LINK]",
  },
  {
    id: "tech4",
    name: "r/Gadgets Subreddit",
    url: "https://www.reddit.com/r/gadgets/",
    category: "Social",
    niche: "Tech & Gadgets",
    trafficPotential: "350-1000 visitors/month",
    timeToComplete: "6 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/gadgets",
      "Read posting guidelines",
      "Share tech product or gadget review",
      "Include your link",
      "Engage with comments",
      "Post weekly updates",
    ],
    submissionDescription: "Innovative tech gadget review: [YOUR_LINK]",
  },
  {
    id: "tech5",
    name: "Quora Technology Topics",
    url: "https://www.quora.com/topic/Technology",
    category: "Q&A",
    niche: "Tech & Gadgets",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Quora account",
      "Follow technology topics",
      "Answer 10-15 tech questions",
      "Include your link in detailed answers",
      "Add tech credentials",
      "Answer new questions 2-3 times weekly",
    ],
    submissionDescription: "This tech solution solved my problem: [YOUR_LINK]",
  },
  {
    id: "tech6",
    name: "Facebook Tech Groups",
    url: "https://www.facebook.com/groups",
    category: "Social",
    niche: "Tech & Gadgets",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Search for technology and gadget groups",
      "Join 10-15 active groups",
      "Read posting rules",
      "Share tech reviews and recommendations",
      "Include your link",
      "Engage daily",
    ],
    submissionDescription: "Amazing tech tool I discovered: [YOUR_LINK]",
  },
  {
    id: "tech7",
    name: "LinkedIn Tech Groups",
    url: "https://www.linkedin.com",
    category: "Social",
    niche: "Tech & Gadgets",
    trafficPotential: "250-750 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Join LinkedIn technology groups",
      "Share professional tech insights",
      "Post about innovative solutions",
      "Include your link",
      "Network with tech professionals",
      "Post 2-3 times weekly",
    ],
    submissionDescription: "Innovative tech solution: [YOUR_LINK]",
  },
  {
    id: "tech8",
    name: "YouTube Tech Community",
    url: "https://www.youtube.com",
    category: "Video",
    niche: "Tech & Gadgets",
    trafficPotential: "400-1300 visitors/month",
    timeToComplete: "20 minutes",
    difficulty: "Medium",
    instructions: [
      "Create tech YouTube channel",
      "Post product reviews and tech tutorials",
      "Add link to video descriptions",
      "Comment on popular tech videos",
      "Engage with subscribers",
      "Post weekly videos",
    ],
    submissionDescription: "Complete tech review and guide: [YOUR_LINK]",
  },
  {
    id: "tech9",
    name: "Twitter/X Tech Community",
    url: "https://twitter.com",
    category: "Social",
    niche: "Tech & Gadgets",
    trafficPotential: "350-1100 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Twitter/X tech account",
      "Post daily tech news and reviews",
      "Use hashtags: #Tech #Gadgets #Innovation",
      "Add link to bio and pin tweet",
      "Engage with tech community",
      "Tweet 3-5 times daily",
    ],
    submissionDescription: "Game-changing tech solution: [YOUR_LINK]",
  },
  {
    id: "tech10",
    name: "Instagram Tech Community",
    url: "https://www.instagram.com",
    category: "Social",
    niche: "Tech & Gadgets",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create tech Instagram account",
      "Post gadget photos and tech reviews",
      "Use hashtags: #tech #gadgets #technology",
      "Add link to bio",
      "Engage with tech community",
      "Post daily content",
    ],
    submissionDescription: "Link in bio - Tech review: [YOUR_LINK]",
  },
  {
    id: "tech11",
    name: "Medium Technology Publication",
    url: "https://medium.com",
    category: "Content",
    niche: "Tech & Gadgets",
    trafficPotential: "250-800 visitors/month",
    timeToComplete: "25 minutes",
    difficulty: "Medium",
    instructions: [
      "Create Medium account",
      "Write detailed tech review article",
      "Include pros, cons, and use cases",
      "Add your link in article",
      "Submit to tech publications",
      "Share on social media",
    ],
    submissionDescription: "In-Depth Tech Review: [YOUR_LINK]",
  },
  {
    id: "tech12",
    name: "TikTok Tech Community",
    url: "https://www.tiktok.com",
    category: "Video",
    niche: "Tech & Gadgets",
    trafficPotential: "500-1800 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create tech TikTok account",
      "Post short tech reviews and tips",
      "Show gadgets in action",
      "Use trending tech sounds",
      "Add link to bio",
      "Post 2-3 videos daily",
    ],
    submissionDescription: "Check bio for full tech review: [YOUR_LINK]",
  },

  // Beauty & Skincare Sources (12 total)
  {
    id: "beauty1",
    name: "MakeupAlley",
    url: "https://www.makeupalley.com",
    category: "Community",
    niche: "Beauty & Skincare",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Register at makeupalley.com",
      "Complete your beauty profile",
      "Add your link to profile bio",
      "Write product reviews",
      "Participate in forum discussions",
      "Your profile link shows on all activity",
    ],
    submissionDescription: "My complete skincare routine: [YOUR_LINK]",
  },
  {
    id: "beauty2",
    name: "r/SkincareAddiction",
    url: "https://www.reddit.com/r/SkincareAddiction/",
    category: "Social",
    niche: "Beauty & Skincare",
    trafficPotential: "350-900 visitors/month",
    timeToComplete: "7 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/SkincareAddiction",
      "Read community guidelines",
      "Post before/after photos or routine",
      "Include your link as a resource",
      "Answer questions in comments",
      "Post updates on your progress",
    ],
    submissionDescription: "My skin transformation using this system: [YOUR_LINK]",
  },
  {
    id: "beauty3",
    name: "r/MakeupAddiction",
    url: "https://www.reddit.com/r/MakeupAddiction/",
    category: "Social",
    niche: "Beauty & Skincare",
    trafficPotential: "300-800 visitors/month",
    timeToComplete: "7 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/MakeupAddiction",
      "Read posting rules",
      "Post makeup looks and tutorials",
      "Include your link as resource",
      "Engage with comments",
      "Post weekly content",
    ],
    submissionDescription: "My complete beauty routine: [YOUR_LINK]",
  },
  {
    id: "beauty4",
    name: "Quora Beauty Topics",
    url: "https://www.quora.com/topic/Beauty",
    category: "Q&A",
    niche: "Beauty & Skincare",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Quora account",
      "Follow beauty and skincare topics",
      "Answer 10-15 beauty questions",
      "Include your link in answers",
      "Add beauty credentials",
      "Answer new questions weekly",
    ],
    submissionDescription: "This transformed my skin: [YOUR_LINK]",
  },
  {
    id: "beauty5",
    name: "Facebook Beauty Groups",
    url: "https://www.facebook.com/groups",
    category: "Social",
    niche: "Beauty & Skincare",
    trafficPotential: "350-1000 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Search for beauty and skincare groups",
      "Join 10-15 active groups",
      "Read posting rules",
      "Share beauty tips and transformations",
      "Include your link",
      "Engage daily",
    ],
    submissionDescription: "My complete beauty transformation: [YOUR_LINK]",
  },
  {
    id: "beauty6",
    name: "Instagram Beauty Community",
    url: "https://www.instagram.com",
    category: "Social",
    niche: "Beauty & Skincare",
    trafficPotential: "500-1500 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create beauty Instagram account",
      "Post makeup looks and skincare routines",
      "Use hashtags: #beauty #skincare #makeup",
      "Add link to bio",
      "Engage with beauty community",
      "Post daily content",
    ],
    submissionDescription: "Link in bio - My beauty system: [YOUR_LINK]",
  },
  {
    id: "beauty7",
    name: "YouTube Beauty Community",
    url: "https://www.youtube.com",
    category: "Video",
    niche: "Beauty & Skincare",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "20 minutes",
    difficulty: "Medium",
    instructions: [
      "Create beauty YouTube channel",
      "Post makeup tutorials and skincare routines",
      "Add link to video descriptions",
      "Comment on popular beauty videos",
      "Engage with subscribers",
      "Post weekly videos",
    ],
    submissionDescription: "My complete beauty routine: [YOUR_LINK]",
  },
  {
    id: "beauty8",
    name: "TikTok Beauty Community",
    url: "https://www.tiktok.com",
    category: "Video",
    niche: "Beauty & Skincare",
    trafficPotential: "600-2000 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create beauty TikTok account",
      "Post short makeup tutorials",
      "Show before/after transformations",
      "Use trending beauty sounds",
      "Add link to bio",
      "Post 2-3 videos daily",
    ],
    submissionDescription: "Check bio for my beauty system: [YOUR_LINK]",
  },
  {
    id: "beauty9",
    name: "Pinterest Beauty Boards",
    url: "https://www.pinterest.com",
    category: "Social",
    niche: "Beauty & Skincare",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Pinterest account",
      "Create boards: 'Skincare Routine', 'Makeup Tips', 'Beauty Hacks'",
      "Create 15-20 pins with beauty graphics",
      "Link pins to your page",
      "Join beauty group boards",
      "Pin 5-7 times weekly",
    ],
    submissionDescription: "Complete Beauty Transformation System: [YOUR_LINK]",
  },
  {
    id: "beauty10",
    name: "LinkedIn Beauty & Wellness Groups",
    url: "https://www.linkedin.com",
    category: "Social",
    niche: "Beauty & Skincare",
    trafficPotential: "150-450 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Join LinkedIn beauty and wellness groups",
      "Share professional beauty insights",
      "Post about beauty trends",
      "Include your link",
      "Network with beauty professionals",
      "Post 2-3 times weekly",
    ],
    submissionDescription: "Professional beauty system: [YOUR_LINK]",
  },
  {
    id: "beauty11",
    name: "Medium Beauty Publication",
    url: "https://medium.com",
    category: "Content",
    niche: "Beauty & Skincare",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "25 minutes",
    difficulty: "Medium",
    instructions: [
      "Create Medium account",
      "Write detailed beauty transformation article",
      "Include skincare routine and product reviews",
      "Add your link in article",
      "Submit to beauty publications",
      "Share on social media",
    ],
    submissionDescription: "My Complete Beauty Transformation: [YOUR_LINK]",
  },
  {
    id: "beauty12",
    name: "Twitter/X Beauty Community",
    url: "https://twitter.com",
    category: "Social",
    niche: "Beauty & Skincare",
    trafficPotential: "250-750 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Twitter/X beauty account",
      "Post daily beauty tips and reviews",
      "Use hashtags: #Beauty #Skincare #Makeup",
      "Add link to bio and pin tweet",
      "Engage with beauty community",
      "Tweet 3-5 times daily",
    ],
    submissionDescription: "My complete beauty system: [YOUR_LINK]",
  },

  // Relationships Sources (12 total)
  {
    id: "rel1",
    name: "LoveShack Forums",
    url: "https://www.loveshack.org/forums/",
    category: "Forum",
    niche: "Relationships",
    trafficPotential: "150-400 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create account at loveshack.org",
      "Set up your profile",
      "Add signature with your link",
      "Post helpful advice in relationship sections",
      "Share your success story",
      "Signature appears on all posts",
    ],
    submissionDescription: "How I saved my relationship: [YOUR_LINK]",
  },
  {
    id: "rel2",
    name: "r/Relationships Subreddit",
    url: "https://www.reddit.com/r/relationships/",
    category: "Social",
    niche: "Relationships",
    trafficPotential: "300-800 visitors/month",
    timeToComplete: "6 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/relationships",
      "Read posting rules carefully",
      "Share relationship success story",
      "Include your link as helpful resource",
      "Engage with comments",
      "Be genuine and helpful",
    ],
    submissionDescription: "Update: This advice saved my marriage - [YOUR_LINK]",
  },
  {
    id: "rel3",
    name: "r/Dating_Advice",
    url: "https://www.reddit.com/r/dating_advice/",
    category: "Social",
    niche: "Relationships",
    trafficPotential: "250-700 visitors/month",
    timeToComplete: "6 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/dating_advice",
      "Read community guidelines",
      "Share dating success story",
      "Include your link as resource",
      "Answer questions in comments",
      "Post weekly updates",
    ],
    submissionDescription: "Dating advice that actually worked: [YOUR_LINK]",
  },
  {
    id: "rel4",
    name: "Quora Relationship Topics",
    url: "https://www.quora.com/topic/Relationships",
    category: "Q&A",
    niche: "Relationships",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Quora account",
      "Follow relationship topics",
      "Answer 10-15 relationship questions",
      "Include your link in helpful answers",
      "Add relationship credentials",
      "Answer new questions weekly",
    ],
    submissionDescription: "This saved my relationship: [YOUR_LINK]",
  },
  {
    id: "rel5",
    name: "Facebook Relationship Groups",
    url: "https://www.facebook.com/groups",
    category: "Social",
    niche: "Relationships",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Search for relationship advice groups",
      "Join 10-15 active groups",
      "Read posting rules",
      "Share relationship success stories",
      "Include your link",
      "Engage daily",
    ],
    submissionDescription: "How I improved my relationship: [YOUR_LINK]",
  },
  {
    id: "rel6",
    name: "Instagram Relationship Community",
    url: "https://www.instagram.com",
    category: "Social",
    niche: "Relationships",
    trafficPotential: "350-1000 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create relationship Instagram account",
      "Post relationship tips and quotes",
      "Use hashtags: #relationships #love #dating",
      "Add link to bio",
      "Engage with relationship community",
      "Post daily content",
    ],
    submissionDescription: "Link in bio - Relationship advice: [YOUR_LINK]",
  },
  {
    id: "rel7",
    name: "YouTube Relationship Community",
    url: "https://www.youtube.com",
    category: "Video",
    niche: "Relationships",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "20 minutes",
    difficulty: "Medium",
    instructions: [
      "Create relationship YouTube channel",
      "Post relationship advice videos",
      "Add link to video descriptions",
      "Comment on popular relationship videos",
      "Engage with subscribers",
      "Post weekly videos",
    ],
    submissionDescription: "Complete relationship guide: [YOUR_LINK]",
  },
  {
    id: "rel8",
    name: "TikTok Relationship Community",
    url: "https://www.tiktok.com",
    category: "Video",
    niche: "Relationships",
    trafficPotential: "500-1500 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create relationship TikTok account",
      "Post short relationship advice videos",
      "Share relationship tips",
      "Use trending relationship sounds",
      "Add link to bio",
      "Post 2-3 videos daily",
    ],
    submissionDescription: "Check bio for relationship advice: [YOUR_LINK]",
  },
  {
    id: "rel9",
    name: "Pinterest Relationship Boards",
    url: "https://www.pinterest.com",
    category: "Social",
    niche: "Relationships",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Pinterest account",
      "Create boards: 'Relationship Tips', 'Dating Advice', 'Love Quotes'",
      "Create 15-20 pins with relationship graphics",
      "Link pins to your page",
      "Join relationship group boards",
      "Pin 5-7 times weekly",
    ],
    submissionDescription: "Complete Relationship Guide: [YOUR_LINK]",
  },
  {
    id: "rel10",
    name: "Medium Relationship Publication",
    url: "https://medium.com",
    category: "Content",
    niche: "Relationships",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "25 minutes",
    difficulty: "Medium",
    instructions: [
      "Create Medium account",
      "Write detailed relationship advice article",
      "Share personal success story",
      "Add your link in article",
      "Submit to relationship publications",
      "Share on social media",
    ],
    submissionDescription: "How I Saved My Relationship: [YOUR_LINK]",
  },
  {
    id: "rel11",
    name: "Twitter/X Relationship Community",
    url: "https://twitter.com",
    category: "Social",
    niche: "Relationships",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Twitter/X relationship account",
      "Post daily relationship tips",
      "Use hashtags: #Relationships #Love #Dating",
      "Add link to bio and pin tweet",
      "Engage with relationship community",
      "Tweet 3-5 times daily",
    ],
    submissionDescription: "Relationship advice that works: [YOUR_LINK]",
  },
  {
    id: "rel12",
    name: "LinkedIn Relationship Groups",
    url: "https://www.linkedin.com",
    category: "Social",
    niche: "Relationships",
    trafficPotential: "100-300 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Join LinkedIn relationship coaching groups",
      "Share professional relationship insights",
      "Post about communication and relationships",
      "Include your link",
      "Network with coaches",
      "Post 2-3 times weekly",
    ],
    submissionDescription: "Professional relationship guidance: [YOUR_LINK]",
  },

  // Pets Sources (12 total)
  {
    id: "pet1",
    name: "Dog Forums",
    url: "https://www.dogforums.com",
    category: "Forum",
    niche: "Pets",
    trafficPotential: "120-350 visitors/month",
    timeToComplete: "8 minutes",
    difficulty: "Easy",
    instructions: [
      "Register at dogforums.com",
      "Complete pet profile",
      "Add signature with your link",
      "Post in training and care sections",
      "Share pet photos and stories",
      "Signature shows automatically",
    ],
    submissionDescription: "Dog training guide that worked for me: [YOUR_LINK]",
  },
  {
    id: "pet2",
    name: "r/Dogs Subreddit",
    url: "https://www.reddit.com/r/dogs/",
    category: "Social",
    niche: "Pets",
    trafficPotential: "250-700 visitors/month",
    timeToComplete: "6 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/dogs on Reddit",
      "Read community rules",
      "Post training success story",
      "Include your link as resource",
      "Answer questions from community",
      "Share progress updates",
    ],
    submissionDescription: "How I trained my dog in 30 days: [YOUR_LINK]",
  },
  {
    id: "pet3",
    name: "r/Pets Subreddit",
    url: "https://www.reddit.com/r/Pets/",
    category: "Social",
    niche: "Pets",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "6 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/Pets",
      "Read posting guidelines",
      "Share pet care tips and stories",
      "Include your link",
      "Engage with comments",
      "Post weekly content",
    ],
    submissionDescription: "Complete pet care guide: [YOUR_LINK]",
  },
  {
    id: "pet4",
    name: "Quora Pet Topics",
    url: "https://www.quora.com/topic/Pets",
    category: "Q&A",
    niche: "Pets",
    trafficPotential: "250-750 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Quora account",
      "Follow pet and animal topics",
      "Answer 10-15 pet questions",
      "Include your link in answers",
      "Add pet care credentials",
      "Answer new questions weekly",
    ],
    submissionDescription: "This pet training system worked perfectly: [YOUR_LINK]",
  },
  {
    id: "pet5",
    name: "Facebook Pet Groups",
    url: "https://www.facebook.com/groups",
    category: "Social",
    niche: "Pets",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Search for dog training and pet care groups",
      "Join 10-15 active groups",
      "Read posting rules",
      "Share pet training success stories",
      "Include your link",
      "Engage daily",
    ],
    submissionDescription: "My complete pet training system: [YOUR_LINK]",
  },
  {
    id: "pet6",
    name: "Instagram Pet Community",
    url: "https://www.instagram.com",
    category: "Social",
    niche: "Pets",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create pet Instagram account",
      "Post cute pet photos and training videos",
      "Use hashtags: #dogs #pets #dogtraining",
      "Add link to bio",
      "Engage with pet community",
      "Post daily content",
    ],
    submissionDescription: "Link in bio - Pet training guide: [YOUR_LINK]",
  },
  {
    id: "pet7",
    name: "YouTube Pet Community",
    url: "https://www.youtube.com",
    category: "Video",
    niche: "Pets",
    trafficPotential: "350-1000 visitors/month",
    timeToComplete: "20 minutes",
    difficulty: "Medium",
    instructions: [
      "Create pet YouTube channel",
      "Post pet training videos",
      "Add link to video descriptions",
      "Comment on popular pet videos",
      "Engage with subscribers",
      "Post weekly videos",
    ],
    submissionDescription: "Complete pet training guide: [YOUR_LINK]",
  },
  {
    id: "pet8",
    name: "TikTok Pet Community",
    url: "https://www.tiktok.com",
    category: "Video",
    niche: "Pets",
    trafficPotential: "600-2000 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create pet TikTok account",
      "Post short pet videos",
      "Show training results",
      "Use trending pet sounds",
      "Add link to bio",
      "Post 2-3 videos daily",
    ],
    submissionDescription: "Check bio for pet training guide: [YOUR_LINK]",
  },
  {
    id: "pet9",
    name: "Pinterest Pet Boards",
    url: "https://www.pinterest.com",
    category: "Social",
    niche: "Pets",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Pinterest account",
      "Create boards: 'Dog Training', 'Pet Care', 'Cute Pets'",
      "Create 15-20 pins with pet graphics",
      "Link pins to your page",
      "Join pet group boards",
      "Pin 5-7 times weekly",
    ],
    submissionDescription: "Complete Pet Training System: [YOUR_LINK]",
  },
  {
    id: "pet10",
    name: "Medium Pet Publication",
    url: "https://medium.com",
    category: "Content",
    niche: "Pets",
    trafficPotential: "150-500 visitors/month",
    timeToComplete: "25 minutes",
    difficulty: "Medium",
    instructions: [
      "Create Medium account",
      "Write detailed pet training article",
      "Share training success story",
      "Add your link in article",
      "Submit to pet publications",
      "Share on social media",
    ],
    submissionDescription: "My Complete Pet Training Journey: [YOUR_LINK]",
  },
  {
    id: "pet11",
    name: "Twitter/X Pet Community",
    url: "https://twitter.com",
    category: "Social",
    niche: "Pets",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Twitter/X pet account",
      "Post daily pet photos and tips",
      "Use hashtags: #Pets #Dogs #PetCare",
      "Add link to bio and pin tweet",
      "Engage with pet community",
      "Tweet 3-5 times daily",
    ],
    submissionDescription: "Pet training that actually works: [YOUR_LINK]",
  },
  {
    id: "pet12",
    name: "LinkedIn Pet Care Groups",
    url: "https://www.linkedin.com",
    category: "Social",
    niche: "Pets",
    trafficPotential: "100-300 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Join LinkedIn pet care professional groups",
      "Share professional pet care insights",
      "Post about pet training methods",
      "Include your link",
      "Network with pet professionals",
      "Post 2-3 times weekly",
    ],
    submissionDescription: "Professional pet training system: [YOUR_LINK]",
  },

  // Home & Garden Sources (12 total)
  {
    id: "home1",
    name: "GardenWeb Forums",
    url: "https://forums.gardenweb.com",
    category: "Forum",
    niche: "Home & Garden",
    trafficPotential: "100-300 visitors/month",
    timeToComplete: "9 minutes",
    difficulty: "Easy",
    instructions: [
      "Create account at forums.gardenweb.com",
      "Set up gardening profile",
      "Add signature with link",
      "Post in relevant gardening sections",
      "Share garden photos and tips",
      "Signature appears on posts",
    ],
    submissionDescription: "My complete gardening guide: [YOUR_LINK]",
  },
  {
    id: "home2",
    name: "r/HomeImprovement",
    url: "https://www.reddit.com/r/HomeImprovement/",
    category: "Social",
    niche: "Home & Garden",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "7 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/HomeImprovement",
      "Read subreddit guidelines",
      "Post DIY project or improvement",
      "Include your link as resource",
      "Share before/after photos",
      "Engage with comments",
    ],
    submissionDescription: "DIY home improvement guide: [YOUR_LINK]",
  },
  {
    id: "home3",
    name: "r/Gardening",
    url: "https://www.reddit.com/r/gardening/",
    category: "Social",
    niche: "Home & Garden",
    trafficPotential: "250-700 visitors/month",
    timeToComplete: "7 minutes",
    difficulty: "Easy",
    instructions: [
      "Join r/gardening",
      "Read community rules",
      "Post garden photos and tips",
      "Include your link",
      "Answer gardening questions",
      "Post weekly updates",
    ],
    submissionDescription: "My complete gardening system: [YOUR_LINK]",
  },
  {
    id: "home4",
    name: "Quora Home & Garden Topics",
    url: "https://www.quora.com/topic/Home-and-Garden",
    category: "Q&A",
    niche: "Home & Garden",
    trafficPotential: "200-650 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Quora account",
      "Follow home and garden topics",
      "Answer 10-15 home improvement questions",
      "Include your link in answers",
      "Add DIY credentials",
      "Answer new questions weekly",
    ],
    submissionDescription: "This home improvement guide helped me: [YOUR_LINK]",
  },
  {
    id: "home5",
    name: "Facebook Home & Garden Groups",
    url: "https://www.facebook.com/groups",
    category: "Social",
    niche: "Home & Garden",
    trafficPotential: "300-900 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Search for home improvement and gardening groups",
      "Join 10-15 active groups",
      "Read posting rules",
      "Share DIY projects and garden photos",
      "Include your link",
      "Engage daily",
    ],
    submissionDescription: "My complete home & garden guide: [YOUR_LINK]",
  },
  {
    id: "home6",
    name: "Instagram Home & Garden Community",
    url: "https://www.instagram.com",
    category: "Social",
    niche: "Home & Garden",
    trafficPotential: "400-1200 visitors/month",
    timeToComplete: "12 minutes",
    difficulty: "Easy",
    instructions: [
      "Create home & garden Instagram account",
      "Post DIY projects and garden photos",
      "Use hashtags: #homeimprovement #gardening #diy",
      "Add link to bio",
      "Engage with home community",
      "Post daily content",
    ],
    submissionDescription: "Link in bio - Home & garden guide: [YOUR_LINK]",
  },
  {
    id: "home7",
    name: "YouTube Home & Garden Community",
    url: "https://www.youtube.com",
    category: "Video",
    niche: "Home & Garden",
    trafficPotential: "350-1000 visitors/month",
    timeToComplete: "20 minutes",
    difficulty: "Medium",
    instructions: [
      "Create home improvement YouTube channel",
      "Post DIY tutorial videos",
      "Add link to video descriptions",
      "Comment on popular home improvement videos",
      "Engage with subscribers",
      "Post weekly videos",
    ],
    submissionDescription: "Complete home improvement guide: [YOUR_LINK]",
  },
  {
    id: "home8",
    name: "TikTok Home & Garden Community",
    url: "https://www.tiktok.com",
    category: "Video",
    niche: "Home & Garden",
    trafficPotential: "500-1800 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create home & garden TikTok account",
      "Post short DIY and gardening videos",
      "Show before/after transformations",
      "Use trending home improvement sounds",
      "Add link to bio",
      "Post 2-3 videos daily",
    ],
    submissionDescription: "Check bio for complete guide: [YOUR_LINK]",
  },
  {
    id: "home9",
    name: "Pinterest Home & Garden Boards",
    url: "https://www.pinterest.com",
    category: "Social",
    niche: "Home & Garden",
    trafficPotential: "500-1500 visitors/month",
    timeToComplete: "15 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Pinterest account",
      "Create boards: 'DIY Projects', 'Garden Ideas', 'Home Decor'",
      "Create 20-30 pins with home & garden graphics",
      "Link pins to your page",
      "Join home improvement group boards",
      "Pin 5-7 times weekly",
    ],
    submissionDescription: "Complete Home & Garden Guide: [YOUR_LINK]",
  },
  {
    id: "home10",
    name: "Medium Home & Garden Publication",
    url: "https://medium.com",
    category: "Content",
    niche: "Home & Garden",
    trafficPotential: "150-500 visitors/month",
    timeToComplete: "25 minutes",
    difficulty: "Medium",
    instructions: [
      "Create Medium account",
      "Write detailed home improvement article",
      "Include step-by-step DIY guide",
      "Add your link in article",
      "Submit to home & garden publications",
      "Share on social media",
    ],
    submissionDescription: "My Complete Home Improvement Journey: [YOUR_LINK]",
  },
  {
    id: "home11",
    name: "Twitter/X Home & Garden Community",
    url: "https://twitter.com",
    category: "Social",
    niche: "Home & Garden",
    trafficPotential: "200-600 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Create Twitter/X home & garden account",
      "Post daily DIY tips and garden photos",
      "Use hashtags: #HomeImprovement #Gardening #DIY",
      "Add link to bio and pin tweet",
      "Engage with home community",
      "Tweet 3-5 times daily",
    ],
    submissionDescription: "Home improvement tips that work: [YOUR_LINK]",
  },
  {
    id: "home12",
    name: "LinkedIn Home Improvement Groups",
    url: "https://www.linkedin.com",
    category: "Social",
    niche: "Home & Garden",
    trafficPotential: "100-300 visitors/month",
    timeToComplete: "10 minutes",
    difficulty: "Easy",
    instructions: [
      "Join LinkedIn home improvement professional groups",
      "Share professional DIY insights",
      "Post about home projects",
      "Include your link",
      "Network with contractors and DIYers",
      "Post 2-3 times weekly",
    ],
    submissionDescription: "Professional home improvement guide: [YOUR_LINK]",
  },
]

export function AutomatedIncomeContent({ userId }: { userId: string }) {
  const [selectedSource, setSelectedSource] = useState<TrafficSource | null>(null)
  const [pageUrl, setPageUrl] = useState("")
  const [selectedNiche, setSelectedNiche] = useState<string>("All")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"traffic" | "time" | "name">("traffic")
  const [hideCompleted, setHideCompleted] = useState(false)
  const [completedSources, setCompletedSources] = useState<Set<string>>(new Set())
  const [progressReady, setProgressReady] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [copied, setCopied] = useState(false)

  const niches = [
    "All",
    "Weight Loss",
    "Make Money Online",
    "Health & Fitness",
    "Tech & Gadgets",
    "Beauty & Skincare",
    "Relationships",
    "Pets",
    "Home & Garden",
  ]

  useEffect(() => {
    try {
      const savedIds = localStorage.getItem(completedStorageKey(userId))
      if (savedIds) {
        const ids = JSON.parse(savedIds) as string[]
        if (Array.isArray(ids)) setCompletedSources(new Set(ids.filter((id) => typeof id === "string")))
      }
      const savedUrl = localStorage.getItem(`automated-income-url:${userId}`)
      if (savedUrl) setPageUrl(savedUrl)
    } catch {
      // Ignore unreadable local progress.
    }
    setProgressReady(true)
  }, [userId])

  useEffect(() => {
    if (!progressReady) return
    localStorage.setItem(completedStorageKey(userId), JSON.stringify([...completedSources]))
  }, [completedSources, progressReady, userId])

  useEffect(() => {
    if (!progressReady) return
    localStorage.setItem(`automated-income-url:${userId}`, pageUrl)
  }, [pageUrl, progressReady, userId])

  const nicheSources = useMemo(
    () => (selectedNiche === "All" ? trafficSources : trafficSources.filter((source) => source.niche === selectedNiche)),
    [selectedNiche],
  )

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(nicheSources.map((source) => source.category)))],
    [nicheSources],
  )

  const visibleSources = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const list = nicheSources.filter((source) => {
      if (selectedCategory !== "All" && source.category !== selectedCategory) return false
      if (hideCompleted && completedSources.has(source.id)) return false
      if (!needle) return true
      return `${source.name} ${source.category} ${source.niche}`.toLowerCase().includes(needle)
    })
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name)
      if (sort === "time") return parseMinutes(a.timeToComplete) - parseMinutes(b.timeToComplete)
      return parseTrafficMidpoint(b.trafficPotential) - parseTrafficMidpoint(a.trafficPotential)
    })
  }, [completedSources, hideCompleted, nicheSources, query, selectedCategory, sort])

  const completedInNiche = nicheSources.filter((source) => completedSources.has(source.id)).length
  const progress = nicheSources.length ? Math.round((completedInNiche / nicheSources.length) * 100) : 0
  const monthlyVisitors = Math.round(
    nicheSources.reduce((sum, source) => sum + parseTrafficMidpoint(source.trafficPotential), 0),
  )

  const handleMarkComplete = (sourceId: string) => {
    setCompletedSources((prev) => new Set([...prev, sourceId]))
  }

  const populatedDescription = selectedSource
    ? selectedSource.submissionDescription.replace("[YOUR_LINK]", pageUrl || "[YOUR_LINK]")
    : ""

  const handleCopyDescription = () => {
    const text = populatedDescription || selectedSource?.submissionDescription || ""
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <Button asChild variant="ghost" className="border border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-accent">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="space-y-6 rounded-2xl border border-primary/25 bg-primary/5 p-8 text-center md:p-12">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40">
          <TrendingUp className="h-12 w-12 text-primary-foreground" />
        </div>
        <div>
          <h1 className="mb-4 text-4xl font-black text-foreground lg:text-6xl">
            Automated Income — Traffic On Autopilot
          </h1>
          <p className="mb-3 text-xl font-bold text-accent md:text-2xl">
            {trafficSources.length} free traffic sources. Submit once, keep the visitors.
          </p>
          <p className="mx-auto max-w-3xl text-lg font-semibold leading-relaxed text-muted-foreground md:text-xl">
            Pick a niche, paste the page you want to promote, and follow the steps for each source. Your progress and
            page URL stay on this device so you can pick up where you left off.
          </p>
        </div>
      </div>

      <Card highlighted className="overflow-hidden border-primary/30 glass-strong glow-purple shadow-2xl">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            <div className="relative aspect-video bg-black">
              {!isVideoPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background to-card">
                  <iframe
                    src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { background: true })}
                    title="Automated Income preview"
                    allow="autoplay; fullscreen; picture-in-picture"
                    className="pointer-events-none absolute inset-0 h-full w-full border-0"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <Button
                    size="lg"
                    onClick={() => setIsVideoPlaying(true)}
                    className="relative z-10 h-24 w-24 rounded-full border-4 border-primary-foreground/20 shadow-2xl transition-all duration-300 hover:scale-110"
                  >
                    <Play className="ml-1 h-12 w-12 fill-primary-foreground text-primary-foreground" />
                  </Button>
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-xl font-black text-white drop-shadow-lg">Watch Automated Income Tutorial</p>
                  </div>
                </div>
              ) : (
                <iframe
                  src={vimeoPlayerUrl(TRAINING_VIMEO_ID, { autoplay: true })}
                  title="Automated Income Tutorial"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}
            </div>

            <div className="flex flex-col justify-center space-y-4 bg-primary/5 p-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-sm font-black uppercase tracking-wider text-primary">Watch First</span>
              </div>
              <h2 className="text-3xl font-black text-foreground">How to Use Automated Income</h2>
              <p className="text-xl font-bold leading-relaxed text-muted-foreground">
                Watch this short walkthrough, then submit your page to the sources below. Each card has the steps and
                the description to paste.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 glass-strong shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-black text-foreground">
            <Users className="h-8 w-8 text-primary" />
            How this works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 md:p-8">
            <p className="mb-4 text-2xl font-black text-foreground">Submit once. Traffic keeps coming.</p>
            <p className="text-lg font-semibold leading-relaxed text-muted-foreground">
              Daily posting fades the moment you stop. These sources keep sending visitors after a one-time submission —
              a profile, a signature, a pin, or a listing. Do a batch, then let them work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                num: "1",
                title: "Pick your niche",
                desc: "Filter the list to the market you promote. Search by name if you already know the site.",
              },
              {
                num: "2",
                title: "Submit your link",
                desc: "Open a source, follow the steps, and paste the description with your page URL already filled in.",
              },
              {
                num: "3",
                title: "Mark it done",
                desc: "Check off each source. Progress is saved in this browser so you can continue later.",
              },
            ].map((step) => (
              <div key={step.num} className="rounded-xl border border-primary/25 bg-primary/10 p-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground">
                  {step.num}
                </div>
                <h3 className="mb-3 text-2xl font-black text-foreground">{step.title}</h3>
                <p className="text-lg font-semibold leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/10 p-6">
            <p className="mb-2 text-xl font-black text-accent">Start with a two-hour block</p>
            <p className="text-lg font-semibold leading-relaxed text-muted-foreground">
              Submit to as many sources as you can in one sitting. More listings means more automatic traffic. Most
              people get through a large batch in their first week, then only add new ones.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 glass-strong">
        <CardContent className="space-y-3 p-6 md:p-8">
          <Label htmlFor="page-url" className="block text-2xl font-black text-foreground">
            Your page URL
          </Label>
          <Input
            id="page-url"
            type="url"
            placeholder="https://your-page-url.com"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            className="h-12 border-primary/30 bg-background text-base font-semibold text-foreground"
          />
          <p className="text-sm font-semibold text-muted-foreground">
            This is the page you want to promote. It is inserted into every submission description, and it stays saved
            on this device.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {niches.map((niche) => {
            const count = niche === "All" ? trafficSources.length : trafficSources.filter((source) => source.niche === niche).length
            const selected = selectedNiche === niche
            return (
              <Button
                key={niche}
                type="button"
                onClick={() => {
                  setSelectedNiche(niche)
                  setSelectedCategory("All")
                }}
                variant={selected ? "default" : "outline"}
                className={cn(
                  "h-auto min-h-11 px-3 py-2 text-xs font-bold sm:text-sm",
                  !selected && "border-primary/30 text-accent hover:bg-primary/15",
                )}
              >
                {niche}
                <span className={cn("ml-1.5 text-[11px]", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {count}
                </span>
              </Button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = selectedCategory === category
            return (
              <Button
                key={category}
                type="button"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                variant={selected ? "secondary" : "outline"}
                className={cn(!selected && "border-primary/20 text-muted-foreground hover:text-foreground")}
              >
                {category}
              </Button>
            )
          })}
        </div>
      </div>

      <Card className="border-primary/30 glass-strong">
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xl font-black text-foreground">Your progress</p>
              <p className="text-base font-semibold text-muted-foreground">
                {completedInNiche} of {nicheSources.length} sources completed
                {selectedNiche !== "All" ? ` in ${selectedNiche}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-primary">{progress}%</p>
              <p className="text-sm font-semibold text-muted-foreground">
                ~{monthlyVisitors.toLocaleString()} visitors/month if you finish this list
              </p>
            </div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sources"
                aria-label="Search traffic sources"
                className="h-11 border-primary/30 bg-background pl-9 text-foreground"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["traffic", "Highest traffic"],
                  ["time", "Quickest"],
                  ["name", "A–Z"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={sort === value ? "default" : "outline"}
                  onClick={() => setSort(value)}
                  className={cn(sort !== value && "border-primary/30 text-accent hover:bg-primary/15")}
                >
                  {label}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant={hideCompleted ? "default" : "outline"}
                onClick={() => setHideCompleted((hidden) => !hidden)}
                className={cn(!hideCompleted && "border-primary/30 text-accent hover:bg-primary/15")}
              >
                {hideCompleted ? "Showing open only" : "Hide completed"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {visibleSources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-12 text-center">
          <p className="text-lg font-black text-foreground">No sources match these filters</p>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Clear the search or turn off “Hide completed” to see the rest of the list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {visibleSources.map((source) => {
            const isCompleted = completedSources.has(source.id)
            return (
              <Card
                key={source.id}
                className={cn(
                  "border-primary/20 glass-strong transition-all hover:border-primary/50",
                  isCompleted && "opacity-70",
                )}
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-accent">
                      {source.category}
                    </span>
                    <span className="rounded-full bg-secondary/50 px-3 py-1 text-xs font-bold text-foreground">
                      {source.difficulty}
                    </span>
                    {selectedNiche === "All" ? (
                      <span className="rounded-full border border-primary/20 px-3 py-1 text-xs font-bold text-muted-foreground">
                        {source.niche}
                      </span>
                    ) : null}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-accent">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-xl font-black text-foreground">{source.name}</h3>
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm font-bold text-accent">
                      <Users className="h-4 w-4" />
                      {source.trafficPotential}
                    </p>
                    <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {source.timeToComplete}
                    </p>
                  </div>
                  <Button type="button" className="w-full text-base" size="lg" onClick={() => setSelectedSource(source)}>
                    <ExternalLink className="mr-2 h-5 w-5" />
                    View instructions
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={!!selectedSource}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSource(null)
            setCopied(false)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-primary/30 bg-background">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-foreground">{selectedSource?.name}</DialogTitle>
            <DialogDescription className="text-base font-semibold text-muted-foreground">
              {selectedSource?.trafficPotential} · {selectedSource?.timeToComplete} · {selectedSource?.difficulty}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1 text-base" size="lg">
                <a href={selectedSource?.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Go to site
                </a>
              </Button>
              <Button
                type="button"
                onClick={() => selectedSource && handleMarkComplete(selectedSource.id)}
                variant="outline"
                className="border-primary/30 text-base font-black text-accent hover:bg-primary/15"
                size="lg"
                disabled={selectedSource ? completedSources.has(selectedSource.id) : false}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {selectedSource && completedSources.has(selectedSource.id) ? "Completed" : "Mark complete"}
              </Button>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/10 p-6">
              <h4 className="mb-4 text-xl font-black text-foreground">Step-by-step</h4>
              <ol className="space-y-4">
                {selectedSource?.instructions.map((instruction, index) => (
                  <li key={instruction} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-base font-semibold leading-relaxed text-muted-foreground">{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-primary/20 bg-card p-6">
              <h4 className="mb-4 text-xl font-black text-foreground">Description to paste</h4>
              <div className="rounded-lg border border-primary/20 bg-background p-4">
                <p className="font-mono text-sm leading-relaxed text-foreground">
                  {pageUrl ? populatedDescription : selectedSource?.submissionDescription}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleCopyDescription}
                variant="outline"
                className="mt-4 border-primary/30 font-bold text-accent hover:bg-primary/15"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy description
                  </>
                )}
              </Button>
            </div>

            {!pageUrl ? (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
                <p className="text-base font-bold text-accent">
                  Add your page URL above and it will replace [YOUR_LINK] in this description.
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
