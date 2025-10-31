import React from "react";
import parse from "html-react-parser";
import { TwitterTweetEmbed } from "react-twitter-embed";

const getYouTubeEmbed = (url) => {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
};

const BlogContentParser = ({ html }) => {
  // ✅ Ensure it's a string
  if (!html) {
    return <div>No content available</div>;
  }

  const options = {
    replace: (domNode) => {
      if (domNode.name === "a" && domNode.attribs?.href) {
        const href = domNode.attribs.href;

        // ✅ YouTube handling
        const youtubeEmbed = getYouTubeEmbed(href);
        if (youtubeEmbed) {
          return (
            <iframe
              width="100%"
              height="400"
              src={youtubeEmbed}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: "8px", margin: "20px 0" }}
            ></iframe>
          );
        }

        // ✅ Twitter handling
        if (href.includes("x.com")) {
          const match = href.match(/status\/(\d+)/);
          if (match) {
            return (
              <div style={{ margin: "20px 0" }}>
                <TwitterTweetEmbed tweetId={match[1]} />
              </div>
            );
          }
        }
      }
    },
  };

  return <div>{parse(html, options)}</div>;
};

export default BlogContentParser;
