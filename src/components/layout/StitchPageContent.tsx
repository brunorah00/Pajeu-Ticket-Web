import {
  getStitchPageContent,
  type StitchScreen,
} from '@/lib/stitch/getStitchPageContent';

type StitchPageContentProps = {
  screen: StitchScreen;
};

export async function StitchPageContent({ screen }: StitchPageContentProps) {
  const html = await getStitchPageContent(screen);

  return (
    <div
      className="stitch-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
