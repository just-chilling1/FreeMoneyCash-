"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, DollarSign } from "lucide-react"

const SUCCESS_STORIES = [
  { name: "Sarah M.", amount: 247, action: "earned from her page" },
  { name: "Mike T.", amount: 1834, action: "generated this week with affiliate links" },
  { name: "Jessica R.", amount: 89, action: "made completing surveys" },
  { name: "David K.", amount: 523, action: "earned from Fast Cash Injection" },
  { name: "Emily W.", amount: 2156, action: "made this month from Free Money Cash" },
  { name: "Chris P.", amount: 412, action: "generated from 3 affiliate pages" },
  { name: "Amanda L.", amount: 678, action: "earned in the last 48 hours" },
  { name: "Ryan B.", amount: 945, action: "made from survey completions" },
  { name: "Nicole H.", amount: 1567, action: "generated this week" },
  { name: "Brandon S.", amount: 334, action: "earned from affiliate clicks" },
  { name: "Melissa D.", amount: 789, action: "made from her first page" },
  { name: "Kevin J.", amount: 2341, action: "generated in 2 weeks" },
  { name: "Rachel F.", amount: 456, action: "earned from Fast Cash today" },
  { name: "Tyler M.", amount: 1123, action: "made this week from Free Money Cash" },
  { name: "Stephanie G.", amount: 567, action: "generated from affiliate marketing" },
  { name: "Jason W.", amount: 891, action: "earned completing offers" },
  { name: "Lauren B.", amount: 1678, action: "made from multiple pages" },
  { name: "Daniel R.", amount: 423, action: "generated in 24 hours" },
  { name: "Ashley T.", amount: 734, action: "earned from surveys and offers" },
  { name: "Matthew C.", amount: 2089, action: "made this month" },
  { name: "Brittany K.", amount: 512, action: "generated from her Free Money Cash" },
  { name: "Andrew H.", amount: 1456, action: "earned from affiliate pages" },
  { name: "Samantha P.", amount: 678, action: "made in the last week" },
  { name: "Justin L.", amount: 923, action: "generated from Fast Cash" },
  { name: "Megan S.", amount: 1789, action: "earned this month from Free Money Cash" },
  { name: "Eric D.", amount: 445, action: "made from survey completions" },
  { name: "Kayla M.", amount: 1234, action: "generated from affiliate marketing" },
  { name: "Nathan F.", amount: 567, action: "earned in 3 days" },
  { name: "Olivia R.", amount: 2456, action: "made this month" },
  { name: "Zachary B.", amount: 789, action: "generated from his pages" },
  { name: "Hannah W.", amount: 634, action: "earned from Fast Cash Injection" },
  { name: "Connor J.", amount: 1567, action: "made this week" },
  { name: "Madison T.", amount: 423, action: "generated from affiliate clicks" },
  { name: "Ethan G.", amount: 1890, action: "earned from Free Money Cash pages" },
  { name: "Alexis H.", amount: 756, action: "made completing offers" },
  { name: "Jacob K.", amount: 2134, action: "generated in 2 weeks" },
  { name: "Taylor P.", amount: 489, action: "earned from surveys" },
  { name: "Logan C.", amount: 1345, action: "made from affiliate marketing" },
  { name: "Sophia L.", amount: 612, action: "generated in 48 hours" },
  { name: "Mason D.", amount: 1923, action: "earned this month" },
  { name: "Isabella M.", amount: 534, action: "made from her Free Money Cash" },
  { name: "Noah S.", amount: 1678, action: "generated from multiple pages" },
  { name: "Emma F.", amount: 723, action: "earned from Fast Cash" },
  { name: "Liam R.", amount: 2267, action: "made this month from Free Money Cash" },
  { name: "Ava B.", amount: 456, action: "generated from affiliate links" },
  { name: "William T.", amount: 1456, action: "earned in one week" },
  { name: "Mia G.", amount: 834, action: "made from survey completions" },
  { name: "James H.", amount: 1789, action: "generated from his pages" },
  { name: "Charlotte K.", amount: 567, action: "earned from Fast Cash Injection" },
  { name: "Benjamin P.", amount: 2345, action: "made this month" },
  { name: "Amelia C.", amount: 678, action: "generated from affiliate marketing" },
  { name: "Lucas L.", amount: 1234, action: "earned in 5 days" },
  { name: "Harper D.", amount: 923, action: "made from her pages" },
  { name: "Henry M.", amount: 1567, action: "generated this week" },
  { name: "Evelyn S.", amount: 445, action: "earned completing offers" },
  { name: "Alexander F.", amount: 2089, action: "made this month from Free Money Cash" },
  { name: "Abigail R.", amount: 789, action: "generated from affiliate clicks" },
  { name: "Michael B.", amount: 1456, action: "earned from Fast Cash" },
  { name: "Emily W.", amount: 634, action: "made in 3 days" },
  { name: "Daniel J.", amount: 1890, action: "generated from his pages" },
  { name: "Elizabeth T.", amount: 512, action: "earned from surveys" },
  { name: "Matthew G.", amount: 2234, action: "made this month" },
  { name: "Sofia H.", amount: 756, action: "generated from affiliate marketing" },
  { name: "Joseph K.", amount: 1345, action: "earned in one week" },
  { name: "Avery P.", amount: 489, action: "made from Fast Cash Injection" },
  { name: "David C.", amount: 1678, action: "generated from multiple pages" },
  { name: "Scarlett L.", amount: 823, action: "earned from her Free Money Cash" },
  { name: "Carter D.", amount: 2156, action: "made this month from Free Money Cash" },
  { name: "Victoria M.", amount: 567, action: "generated from affiliate links" },
  { name: "Wyatt S.", amount: 1234, action: "earned in 4 days" },
  { name: "Aria F.", amount: 678, action: "made from survey completions" },
  { name: "John R.", amount: 1923, action: "generated from his pages" },
  { name: "Grace B.", amount: 445, action: "earned from Fast Cash" },
  { name: "Jack T.", amount: 2345, action: "made this month" },
  { name: "Chloe G.", amount: 789, action: "generated from affiliate marketing" },
  { name: "Luke H.", amount: 1567, action: "earned in one week" },
  { name: "Lily K.", amount: 534, action: "made completing offers" },
  { name: "Jayden P.", amount: 1890, action: "generated from Free Money Cash pages" },
  { name: "Zoey C.", amount: 612, action: "earned from Fast Cash Injection" },
  { name: "Gabriel L.", amount: 2089, action: "made this month from Free Money Cash" },
  { name: "Penelope D.", amount: 756, action: "generated from affiliate clicks" },
  { name: "Anthony M.", amount: 1456, action: "earned in 5 days" },
  { name: "Layla S.", amount: 489, action: "made from her Free Money Cash" },
  { name: "Isaac F.", amount: 1678, action: "generated from multiple pages" },
  { name: "Riley R.", amount: 823, action: "earned from surveys" },
  { name: "Samuel B.", amount: 2234, action: "made this month" },
  { name: "Nora T.", amount: 567, action: "generated from affiliate marketing" },
  { name: "Owen G.", amount: 1345, action: "earned from Fast Cash" },
  { name: "Hazel H.", amount: 678, action: "made in 3 days" },
  { name: "Dylan K.", amount: 1923, action: "generated from his pages" },
  { name: "Ellie P.", amount: 445, action: "earned completing offers" },
  { name: "Nathan C.", amount: 2156, action: "made this month from Free Money Cash" },
  { name: "Aubrey L.", amount: 789, action: "generated from affiliate links" },
  { name: "Caleb D.", amount: 1567, action: "earned in one week" },
  { name: "Addison M.", amount: 534, action: "made from Fast Cash Injection" },
  { name: "Ryan S.", amount: 1890, action: "generated from Free Money Cash pages" },
  { name: "Brooklyn F.", amount: 612, action: "earned from her account" },
  { name: "Christian R.", amount: 2345, action: "made this month" },
  { name: "Savannah B.", amount: 756, action: "generated from affiliate marketing" },
  { name: "Jonathan T.", amount: 1456, action: "earned in 4 days" },
  { name: "Audrey G.", amount: 489, action: "made from survey completions" },
  { name: "Grayson H.", amount: 1678, action: "generated from multiple pages" },
  { name: "Bella K.", amount: 823, action: "earned from Fast Cash" },
  { name: "Jaxon P.", amount: 2089, action: "made this month from Free Money Cash" },
  { name: "Claire C.", amount: 567, action: "generated from affiliate clicks" },
  { name: "Levi L.", amount: 1234, action: "earned in 5 days" },
  { name: "Skylar D.", amount: 678, action: "made from her Free Money Cash" },
  { name: "Josiah M.", amount: 1923, action: "generated from his pages" },
  { name: "Paisley S.", amount: 445, action: "earned completing offers" },
  { name: "Hunter F.", amount: 2234, action: "made this month" },
  { name: "Anna R.", amount: 789, action: "generated from affiliate marketing" },
  { name: "Eli B.", amount: 1567, action: "earned from Fast Cash" },
  { name: "Caroline T.", amount: 534, action: "made in 3 days" },
  { name: "Thomas G.", amount: 1890, action: "generated from Free Money Cash pages" },
  { name: "Genesis H.", amount: 612, action: "earned from surveys" },
  { name: "Charles K.", amount: 2156, action: "made this month from Free Money Cash" },
  { name: "Kennedy P.", amount: 756, action: "generated from affiliate links" },
  { name: "Christopher C.", amount: 1456, action: "earned in one week" },
  { name: "Sadie L.", amount: 489, action: "made from Fast Cash Injection" },
  { name: "Maverick D.", amount: 1678, action: "generated from multiple pages" },
  { name: "Allison M.", amount: 823, action: "earned from her account" },
  { name: "Dominic S.", amount: 2345, action: "made this month" },
  { name: "Gabriella F.", amount: 567, action: "generated from affiliate marketing" },
  { name: "Colton R.", amount: 1234, action: "earned in 4 days" },
  { name: "Madelyn B.", amount: 678, action: "made completing offers" },
  { name: "Easton T.", amount: 1923, action: "generated from his pages" },
  { name: "Serenity G.", amount: 445, action: "earned from Fast Cash" },
  { name: "Adrian H.", amount: 2089, action: "made this month from Free Money Cash" },
  { name: "Natalie K.", amount: 789, action: "generated from affiliate clicks" },
  { name: "Asher P.", amount: 1567, action: "earned in 5 days" },
  { name: "Quinn C.", amount: 534, action: "made from her Free Money Cash" },
  { name: "Nolan L.", amount: 1890, action: "generated from multiple pages" },
  { name: "Ivy D.", amount: 612, action: "earned from surveys" },
  { name: "Cameron M.", amount: 2234, action: "made this month" },
  { name: "Elena S.", amount: 756, action: "generated from affiliate marketing" },
  { name: "Ezra F.", amount: 1456, action: "earned from Fast Cash" },
  { name: "Piper R.", amount: 489, action: "made in 3 days" },
  { name: "Axel B.", amount: 1678, action: "generated from his pages" },
  { name: "Ruby T.", amount: 823, action: "earned completing offers" },
  { name: "Kai G.", amount: 2156, action: "made this month from Free Money Cash" },
  { name: "Eva H.", amount: 567, action: "generated from affiliate links" },
  { name: "Brayden K.", amount: 1345, action: "earned in one week" },
  { name: "Alice P.", amount: 678, action: "made from Fast Cash Injection" },
  { name: "Miles C.", amount: 1923, action: "generated from Free Money Cash pages" },
  { name: "Autumn L.", amount: 445, action: "earned from her account" },
  { name: "Bryson D.", amount: 2345, action: "made this month" },
  { name: "Violet M.", amount: 789, action: "generated from affiliate marketing" },
  { name: "Weston S.", amount: 1567, action: "earned in 4 days" },
  { name: "Emilia F.", amount: 534, action: "made from survey completions" },
  { name: "Declan R.", amount: 1890, action: "generated from multiple pages" },
  { name: "Kinsley B.", amount: 612, action: "earned from Fast Cash" },
  { name: "Silas T.", amount: 2089, action: "made this month from Free Money Cash" },
  { name: "Willow G.", amount: 756, action: "generated from affiliate clicks" },
  { name: "Jameson H.", amount: 1456, action: "earned in 5 days" },
  { name: "Naomi K.", amount: 489, action: "made from her Free Money Cash" },
  { name: "Greyson P.", amount: 1678, action: "generated from his pages" },
  { name: "Luna C.", amount: 823, action: "earned completing offers" },
  { name: "Rowan L.", amount: 2234, action: "made this month" },
  { name: "Nova D.", amount: 567, action: "generated from affiliate marketing" },
  { name: "Sawyer M.", amount: 1234, action: "earned from Fast Cash" },
  { name: "Eliana S.", amount: 678, action: "made in 3 days" },
  { name: "Beau F.", amount: 1923, action: "generated from Free Money Cash pages" },
  { name: "Lydia R.", amount: 445, action: "earned from surveys" },
  { name: "Rhett B.", amount: 2156, action: "made this month from Free Money Cash" },
  { name: "Ariana T.", amount: 789, action: "generated from affiliate links" },
  { name: "Beckett G.", amount: 1567, action: "earned in one week" },
  { name: "Delilah H.", amount: 534, action: "made from Fast Cash Injection" },
  { name: "Ryder K.", amount: 1890, action: "generated from multiple pages" },
  { name: "Athena P.", amount: 612, action: "earned from her account" },
  { name: "Emmett C.", amount: 2345, action: "made this month" },
  { name: "Jade L.", amount: 756, action: "generated from affiliate marketing" },
  { name: "Finn D.", amount: 1456, action: "earned in 4 days" },
  { name: "Gianna M.", amount: 489, action: "made completing offers" },
  { name: "Knox S.", amount: 1678, action: "generated from his pages" },
  { name: "Adalynn F.", amount: 823, action: "earned from Fast Cash" },
  { name: "Cole R.", amount: 2089, action: "made this month from Free Money Cash" },
  { name: "Raelynn B.", amount: 567, action: "generated from affiliate clicks" },
  { name: "Archer T.", amount: 1345, action: "earned in 5 days" },
  { name: "Brielle G.", amount: 678, action: "made from her Free Money Cash" },
  { name: "Theo H.", amount: 1923, action: "generated from multiple pages" },
  { name: "Adalyn K.", amount: 445, action: "earned from surveys" },
  { name: "Felix P.", amount: 2234, action: "made this month" },
  { name: "Emery C.", amount: 789, action: "generated from affiliate marketing" },
]

export function SuccessStories() {
  const [currentStory, setCurrentStory] = useState<(typeof SUCCESS_STORIES)[0] | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showRandomStory = () => {
      const randomStory = SUCCESS_STORIES[Math.floor(Math.random() * SUCCESS_STORIES.length)]
      setCurrentStory(randomStory)
      setIsVisible(true)

      setTimeout(() => {
        setIsVisible(false)
      }, 5000)
    }

    // Show first story after 3 seconds
    const initialTimeout = setTimeout(showRandomStory, 3000)

    // Then show a new story every 60-120 seconds
    const interval = setInterval(
      () => {
        showRandomStory()
      },
      60000 + Math.random() * 60000,
    )

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  if (!currentStory || !isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-gradient-to-r from-emerald-500 to-primary p-[2px] rounded-lg shadow-2xl shadow-emerald-500/50">
        <div className="bg-background rounded-lg p-4 flex items-start gap-3 min-w-[320px] max-w-[400px]">
          <div className="flex-shrink-0 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground mb-1">
              {currentStory.name} just {currentStory.action}!
            </p>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-lg font-black text-emerald-400">${currentStory.amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
