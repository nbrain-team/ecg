import { Proposal } from '../types';

// Generate personalized proposal content
export function generateProposalContent(proposal: any): Proposal['generatedContent'] {
  const { client, eventDetails, destination, resort, selectedDining } = proposal;
  
  // Generate hero title and subtitle
  const heroTitle = generateHeroTitle(client, eventDetails);
  const heroSubtitle = generateHeroSubtitle(eventDetails, destination);
  
  // Generate destination overview
  const destinationOverview = generateDestinationOverview(destination, eventDetails);
  
  // Generate resort highlight
  const resortHighlight = generateResortHighlight(resort, eventDetails);
  
  // Generate dining description
  const diningDescription = generateDiningDescription(selectedDining, eventDetails);
  
  // Generate travel info
  const travelInfo = generateTravelInfo(destination, eventDetails);
  
  return {
    heroTitle,
    heroSubtitle,
    destinationOverview,
    resortHighlight,
    diningDescription,
    travelInfo
  };
}

function generateHeroTitle(client: any, eventDetails: any): string {
  const templates = [
    `${client.company}'s ${eventDetails.purpose} Experience`,
    `Welcome to Your ${eventDetails.purpose} in Paradise`,
    `${client.company}: ${eventDetails.name}`,
    `Your Exclusive ${eventDetails.purpose} Proposal`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateHeroSubtitle(eventDetails: any, destination: any): string {
  const attendeeText = eventDetails.attendeeCount > 50 ? 'large group' : 'intimate gathering';
  const dateRange = `${eventDetails.startDate} - ${eventDetails.endDate}`;
  
  return `An unforgettable ${attendeeText} experience in ${destination?.name || 'paradise'} | ${dateRange}`;
}

function generateDestinationOverview(destination: any, eventDetails: any): string {
  if (!destination) return 'A world-class destination awaits your group.';
  
  const intro = `${destination.name} offers the perfect backdrop for your ${eventDetails.purpose}.`;
  const climate = `With ${destination.climate.toLowerCase()} climate and average temperatures of ${destination.weatherInfo?.avgTemp || 75}°F, your attendees will enjoy ideal weather conditions.`;
  const highlights = destination.highlights ? 
    `Key attractions include ${destination.highlights.slice(0, 3).join(', ')}.` : '';
  const access = destination.flightInfo?.avgFlightTime ? 
    `Just ${destination.flightInfo.avgFlightTime} from major hubs, ${destination.name} provides convenient access for all attendees.` : '';
  
  return `${intro} ${climate} ${highlights} ${access}`.trim();
}

function generateResortHighlight(resort: any, eventDetails: any): string {
  if (!resort) return 'Your selected resort offers world-class amenities and service.';
  
  const intro = `${resort.name} stands as the premier choice for your ${eventDetails.purpose}.`;
  const description = resort.description || 'This luxury property offers an unparalleled experience.';
  const amenities = resort.amenities?.length ? 
    `Featured amenities include ${resort.amenities.slice(0, 3).join(', ').toLowerCase()}, ensuring every need is met.` : '';
  const features = resort.features?.length ? 
    `The property boasts ${resort.features.slice(0, 2).join(' and ').toLowerCase()}.` : '';
  
  return `${intro} ${description} ${amenities} ${features}`.trim();
}

function generateDiningDescription(diningOptions: any[], eventDetails: any): string {
  if (!diningOptions || diningOptions.length === 0) {
    return 'A variety of exceptional dining experiences await your group, from casual beachside fare to elegant fine dining.';
  }
  
  const intro = `Your culinary journey includes ${diningOptions.length} exceptional dining venues.`;
  
  const highlights = diningOptions.slice(0, 3).map(dining => {
    return `${dining.name} (${dining.cuisine}) ${dining.description.toLowerCase()}`;
  }).join('; ');
  
  const conclusion = `Each venue can accommodate your group of ${eventDetails.attendeeCount} with customized menus and private event options.`;
  
  return `${intro} Experience ${highlights}. ${conclusion}`;
}

function generateTravelInfo(destination: any, eventDetails: any): string {
  if (!destination) return 'Convenient flight options are available from major cities across the country.';
  
  const airport = destination.flightInfo?.majorAirports?.[0] || 'the international airport';
  const flightTime = destination.flightInfo?.avgFlightTime || 'a short flight';
  
  const intro = `Getting to ${destination.name} is remarkably convenient with service to ${airport}.`;
  const timing = `Most attendees will enjoy ${flightTime}, minimizing travel fatigue.`;
  const logistics = `Our team will coordinate group transfers and can arrange charter options for parties of ${eventDetails.attendeeCount}.`;
  
  return `${intro} ${timing} ${logistics}`;
}

// Additional content generation helpers
export function generateEmailContent(proposal: Proposal): string {
  return `
Dear ${proposal.client.name},

We're thrilled to present your custom proposal for ${proposal.eventDetails.name} in ${proposal.destination.name}.

This ${proposal.eventDetails.purpose} experience has been carefully crafted for your group of ${proposal.eventDetails.attendeeCount} attendees, scheduled for ${proposal.eventDetails.startDate} to ${proposal.eventDetails.endDate}.

View your interactive proposal: [Link]

Best regards,
The EventIntel Team
  `.trim();
}

export function generateExecutiveSummary(proposal: Proposal): string {
  return `
EXECUTIVE SUMMARY

Event: ${proposal.eventDetails.name}
Company: ${proposal.client.company}
Dates: ${proposal.eventDetails.startDate} - ${proposal.eventDetails.endDate}
Destination: ${proposal.destination.name}, ${proposal.destination.country}
Resort: ${proposal.resort.name}
Attendees: ${proposal.eventDetails.attendeeCount}
Purpose: ${proposal.eventDetails.purpose}

${proposal.generatedContent.destinationOverview}

${proposal.generatedContent.resortHighlight}
  `.trim();
} 