import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Extract transcript using youtube-transcript library
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript available for this video' },
        { status: 404 }
      );
    }

    // Format transcript data
    const plainText = transcript.map(item => item.text).join(' ');
    const timestampedText = transcript.map(item => {
      const minutes = Math.floor(item.offset / 60000);
      const seconds = Math.floor((item.offset % 60000) / 1000);
      const timestamp = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      return `[${timestamp}] ${item.text}`;
    }).join('\n');

    // Calculate metadata
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    const duration = transcript[transcript.length - 1]?.offset || 0;
    const durationFormatted = formatDuration(duration);

    return NextResponse.json({
      success: true,
      data: {
        transcript: transcript,
        plainText: plainText,
        timestampedText: timestampedText,
        metadata: {
          wordCount: wordCount,
          duration: durationFormatted,
          totalSegments: transcript.length
        }
      }
    });

  } catch (error: unknown) {
    console.error('Transcript extraction error:', error);
    
    // Handle specific errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('Could not find captions') || errorMessage.includes('Transcript is disabled')) {
      return NextResponse.json(
        { error: 'No captions/subtitles available for this video. The video may not have auto-generated or manual captions enabled.' },
        { status: 404 }
      );
    }

    if (errorMessage.includes('unavailable') || errorMessage.includes('not available')) {
      return NextResponse.json(
        { error: 'Video is unavailable, private, or deleted' },
        { status: 403 }
      );
    }

    if (errorMessage.includes('Too Many Requests') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a few moments.' },
        { status: 429 }
      );
    }

    if (errorMessage.includes('blocked') || errorMessage.includes('restricted')) {
      return NextResponse.json(
        { error: 'Access to this video is restricted. Try another video.' },
        { status: 403 }
      );
    }

    // Log the full error for debugging
    console.error('Full error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      videoId: 'N/A'
    });

    return NextResponse.json(
      { error: `Failed to extract transcript: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const ss = String(seconds % 60).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}
