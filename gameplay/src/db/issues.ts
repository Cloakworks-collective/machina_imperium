// This file exports the data structure of issues.
// You could also export them as default if you prefer.

export const issuesData = {
    issues: [
      {
        id: 1,
        name: "Internet Censorship Policy",
        description:
          "After the Great Meme War of 2042, the CIA (Censors In Action) wants to clamp down on funny-cat-video overload. Are we willing to sacrifice our daily dose of dancing-lizard GIFs for national security?",
        options: [
          {
            id: 1,
            name: "Total Censorship",
            description:
              "Shut down everything outside our state-run CatPictureNet—no subversive memes allowed!",
            impact: {
              economicFreedom: -4,
              civilRights: -5,
              politicalFreedom: -5,
              gdp: -300
            }
          },
          {
            id: 2,
            name: "Strict Regulations",
            description:
              "Ban shady sites and questionable memes, but keep enough cat pics to avoid nationwide riots.",
            impact: {
              economicFreedom: -2,
              civilRights: -3,
              politicalFreedom: -3,
              gdp: -100
            }
          },
          {
            id: 3,
            name: "Balanced Approach",
            description:
              "Block only clear cybercriminals, leaving the internet free for bizarre dancing fruit videos.",
            impact: {
              economicFreedom: 0,
              civilRights: 2,
              politicalFreedom: 2,
              gdp: -25
            }
          },
          {
            id: 4,
            name: "No Regulation",
            description:
              "Let the virtual Wild West reign, from cat bloopers to bizarre conspiracy theories galore!",
            impact: {
              economicFreedom: 4,
              civilRights: 5,
              politicalFreedom: 4,
              gdp: -50
            }
          }
        ]
      },
      {
        id: 2,
        name: "Gun Control Laws",
        description:
          "Senator RoboShot took on a bear in a wrestling match and lost, fueling a debate on whether we need fewer firearms—or more. It’s bullet bills vs. teddy-bear hug advocates in Freedonia’s hottest standoff!",
        options: [
          {
            id: 1,
            name: "Ban All Guns",
            description:
              "Confiscate every water pistol and potato cannon—call the G.A.S.P. (Gun Abolition Squad Police)!",
            impact: {
              economicFreedom: -3,
              civilRights: -4,
              politicalFreedom: -4,
              gdp: 50
            }
          },
          {
            id: 2,
            name: "Strict Regulations",
            description:
              "Demand ID checks, mental exams, and a two-week waiting period before you can say ‘pew-pew.’",
            impact: {
              economicFreedom: -2,
              civilRights: -1,
              politicalFreedom: -2,
              gdp: 50
            }
          },
          {
            id: 3,
            name: "Minimal Restrictions",
            description:
              "Stop only the dangerously unhinged from arming up; everyone else can keep their foam-firing bazookas.",
            impact: {
              economicFreedom: 3,
              civilRights: 2,
              politicalFreedom: 2,
              gdp: -25
            }
          },
          {
            id: 4,
            name: "Full Gun Freedom",
            description:
              "Anything goes: rocket launchers, laser rifles, even the dreaded Fling-a-Chair 3000—no license needed!",
            impact: {
              economicFreedom: 5,
              civilRights: 2,
              politicalFreedom: 1,
              gdp: -100
            }
          }
        ]
      },
      {
        id: 3,
        name: "Universal Basic Income (UBI)",
        description:
          "A glitch at the Freedonian Treasury showered everyone with free money for a day, causing jubilant chaos. Now people wonder if it should be permanent or just a wild once-in-a-lifetime glitch.",
        options: [
          {
            id: 1,
            name: "Full UBI Implementation",
            description:
              "Hand out monthly checks like confetti—funded by sky-high taxes and a vow of infinite generosity.",
            impact: {
              economicFreedom: -4,
              civilRights: 5,
              politicalFreedom: 2,
              gdp: -300
            }
          },
          {
            id: 2,
            name: "Partial UBI for Low-Income Citizens",
            description:
              "Offer magical money only to those beneath the poverty line; keep the rest of us dreaming.",
            impact: {
              economicFreedom: -2,
              civilRights: 3,
              politicalFreedom: 1,
              gdp: -100
            }
          },
          {
            id: 3,
            name: "No UBI, Invest in Job Programs",
            description:
              "Rather than free lunch, create training and infrastructure so folks can earn a living—and a pizza slice.",
            impact: {
              economicFreedom: 2,
              civilRights: 1,
              politicalFreedom: 2,
              gdp: 200
            }
          },
          {
            id: 4,
            name: "No Government Assistance",
            description:
              "Cut every welfare plan—if you want a burger, you'd better be flipping some patties, friend!",
            impact: {
              economicFreedom: 5,
              civilRights: -2,
              politicalFreedom: -2,
              gdp: 300
            }
          }
        ]
      }
    ]
  };  