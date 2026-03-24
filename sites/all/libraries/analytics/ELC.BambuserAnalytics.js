var site = window.site || {};
(function($, Drupal) {
  Drupal.behaviors.analyticsBambuserBehavior = {
    // @IMPORTANT -- Customize me per brand

    attach: function(context, settings) {
      var self = this;
      var $modules = $('.js-bambuser-block--v1', context);
      if (!settings.bambuser_source && !settings.bambuser_config) {
        return false;
      }
      self.initAnalytics();
    },

    analytics: {
      bambuserObj: {
        event_name: 'bambuser',
        event_category: 'bambuser',
      },
      bambuserGetEventLabel: function(detailData) {
        return typeof detailData.title !== 'undefined' ? detailData.title + ' - ' + detailData.showId : detailData.showId;
      },
      bambuserGetShowLength: function(detailData) {
        return detailData.timeline && typeof detailData.timeline.showLength !== 'undefined' ? detailData.timeline.showLength : null;
      },
      bambuserGetPercentWatchedShow: function(detailData) {
        return detailData.timeline && typeof detailData.timeline.percentWatchedOfShow !== 'undefined' ? detailData.timeline.percentWatchedOfShow : null;
      },
      bambuserGetRelativeTimeShow: function(detailData) {
        return detailData.timeline && typeof detailData.timeline.relativeTimeOfShow !== 'undefined' ? detailData.timeline.relativeTimeOfShow : null;
      },
      bambuserGetVideoType: function(detailData) {
        var videoTypeParam = null;
        if (typeof detailData.isLive !== 'undefined' || (detailData.timeline && typeof detailData.timeline.isLive !== 'undefined')) {
          if (detailData.isLive || (detailData.timeline && detailData.timeline.isLive)) {
            videoTypeParam = 'live';
          } else {
            videoTypeParam = 'archive';
          }
        }
        return videoTypeParam;
      },
      bambuserGetTimelineEventObj: function(detailData) {
        var timelineObj = {};
        timelineObj.video_length = this.bambuserGetShowLength(detailData);
        if (this.bambuserGetPercentWatchedShow(detailData) !== null) {
          timelineObj.video_milestone = this.bambuserGetPercentWatchedShow(detailData);
        }
        if (this.bambuserGetRelativeTimeShow(detailData) !== null) {
          timelineObj.video_playhead = this.bambuserGetRelativeTimeShow(detailData);
        }
        if (this.bambuserGetVideoType(detailData) !== null) {
          timelineObj.video_type = this.bambuserGetVideoType(detailData);
        }
        return timelineObj;
      },
      bambuserGetImpresionProductObj: function(detailData) {
        var items = detailData.items;
        var sku = detailData.sku;
        var productImpObj;
        var impProdList = [];
        var impPosition = [];
        if (sku && typeof sku !== 'undefined') {
          productImpObj = {
            'prodImpId': [String(sku)],
            'position': [1],
          };
        } else if (!!items && items.length) {
          items.forEach(function(item, idx) {
            var itemSku = item.sku;
            if (typeof itemSku !== 'undefined') {
              impProdList.push(String(item.sku));
              impPosition.push(idx + 1);
            }
          });
          productImpObj = {
            'prodImpId': impProdList,
            'position': impPosition,
          };
        } else {
          productImpObj = {
            'prodImpId': null,
            'position': null,
          };
        }
        return productImpObj;
      },
      bambuserOnLoadEvent: function(detailData) {
        var eventObj = {
          event_action: 'video_load',
          event_label: detailData.showId,
          video_id: detailData.showId,
          video_platform: 'bambuser',
        };
        if (typeof detailData.title !== 'undefined') {
          eventObj.video_name = detailData.title;
        }
        if (this.bambuserGetShowLength(detailData) !== null) {
          eventObj.video_length = this.bambuserGetShowLength(detailData);
        }
        if (this.bambuserGetVideoType(detailData) !== null) {
          eventObj.video_type = this.bambuserGetVideoType(detailData);
        }
        Object.assign(eventObj, this.bambuserObj);
        site.track.evtLink(eventObj);
      },
      bambuserWithTimelineEvent: function(eventAction, detailData) {
        var timelineObj = this.bambuserGetTimelineEventObj(detailData);
        var eventObj = {
          event_action: eventAction,
          event_label: detailData.showId,
          video_id: detailData.showId,
          video_platform: 'bambuser',
        };
        if (typeof detailData.title !== 'undefined') {
          eventObj.video_name = detailData.title;
        }
        Object.assign(eventObj, timelineObj, this.bambuserObj);
        site.track.evtLink(eventObj);
      },
      bambuserOnPlayEvent: function(detailData) {
        this.bambuserWithTimelineEvent('video_play', detailData);
      },
      bambuserOnStopEvent: function(detailData) {
        this.bambuserWithTimelineEvent('video_stop', detailData);
      },
      bambuserOnShowProductsEvent: function(eventAction, detailData) {
        var timelineObj = this.bambuserGetTimelineEventObj(detailData);
        var eventObj = {
          event_action: eventAction,
          event_label: detailData.showId,
          video_id: detailData.showId,
          video_platform: 'bambuser',
        };
        Object.assign(eventObj, timelineObj, this.bambuserObj);

        site.track.evtLink(eventObj);
      },
      bambuserOnProductClickEvent: function(detailData) {
        var impProdObj = this.bambuserGetImpresionProductObj(detailData);
        var timelineObj = this.bambuserGetTimelineEventObj(detailData);
        var evProdSurfBehindObj = {
          event_action: 'product_surf_behind',
          event_label: detailData.showId,
          video_id: detailData.showId,
          video_platform: 'bambuser',
        };
        var evProdClickObj = {
          event_action: 'video_product_click',
          event_label: detailData.showId,
          video_id: detailData.showId,
          video_platform: 'bambuser',
          enh_action: 'product_click',
        };
        Object.assign(evProdSurfBehindObj, timelineObj, this.bambuserObj);
        // Track product impression info into the evProdSurfBehindObj
        evProdSurfBehindObj.product_impression_list = ['/bambuser_video - ' + detailData.showId ];
        evProdSurfBehindObj.product_impression_position = impProdObj.position;
        evProdSurfBehindObj.product_impression_id = impProdObj.prodImpId;

        Object.assign(evProdClickObj, timelineObj, this.bambuserObj);
        // Track product info into the evProdClickObj
        evProdClickObj.product_position = impProdObj.position;
        evProdClickObj.product_list = ['/bambuser_video - ' + detailData.showId ];
        evProdClickObj.product_id = impProdObj.prodImpId;

        site.track.evtLink(evProdSurfBehindObj);
        site.track.evtLink(evProdClickObj);
      },
      bambuserOnInteractionEvent: function(detailData) {
        var interactionType = detailData.interactionType;
        switch (interactionType) {
          case 'unmuted':
            this.bambuserWithTimelineEvent('video_unmute', detailData);
            break;
          case 'resume':
            this.bambuserWithTimelineEvent('video_resume', detailData);
            break;
          case 'pause':
            this.bambuserWithTimelineEvent('video_pause', detailData);
            break;
          case 'muted':
            this.bambuserWithTimelineEvent('video_mute', detailData);
            break;
          case 'like':
            this.bambuserWithTimelineEvent('video_like', detailData);
            break;
          case 'chatMessage':
            this.bambuserWithTimelineEvent('video_chat', detailData);
            break;
          case 'close':
            this.bambuserWithTimelineEvent('video_close', detailData);
            break;
          // ecommerce events interaction
          case 'showAllProductsOverlay':
            this.bambuserOnShowProductsEvent('show_product_overlay', detailData);
            break;
          case 'hideAllProductsOverlay':
            this.bambuserOnShowProductsEvent('hide_product_overlay', detailData);
            break;
          case 'goToProductNewWindow':
            this.bambuserOnProductClickEvent(detailData);
            break;
          case 'goToProductSurfBehind':
            this.bambuserOnProductClickEvent(detailData);
            break;
        }
      },
    },
    initAnalytics: function() {
      var self = this;
      if (site && site.track && site.track.evtLink) {
        //Start Bambuser 1:1 tagging
          site.elcEvents.addListener('tealium:loaded', function() {
            if (typeof window.oneToOneEmbed !== 'undefined' && window.hasOwnProperty('oneToOneEmbed')) {
            var meetingId = oneToOneEmbed.connectId;
            function bambuserOneToOne(eventAction) {
              site.track.evtLink({
                event_name: 'bambuser',
                event_category: 'bambuser',
                event_action:  eventAction,
                event_label:  meetingId,
                video_id: '1:1 ' + meetingId,
                video_platform: 'bambuser'
              });
            }
            //On Open
            window.oneToOneEmbed.on('open', function() {
              bambuserOneToOne('open');
            });
            //On waiting-in-queue
            window.oneToOneEmbed.on('waiting-in-queue', function() {
              bambuserOneToOne('waiting in queue');
            });
            //On call-started
            window.oneToOneEmbed.on('call-started', function() {
              bambuserOneToOne('call started');
            });
            //On call-ended
            window.oneToOneEmbed.on('call-ended', function() {
              bambuserOneToOne('call ended');
            });
            //On Close
            window.oneToOneEmbed.on('close', function() {
              bambuserOneToOne('close');
            });
          }
        });
        //End Bambuser 1:1 tagging

        $(document).on('bambuser.launched', function() {
          site.track.evtLink({
            event_name: 'bambuser',
            event_category: 'bambuser',
            event_action: 'launch',
            event_label: 'click',
          });
        });
        // Track slide panel click
        if ($('body').hasClass('section-livestream')) {
          $(document).on('contentBlock.slidePanelRevealed', function() {
            site.track.evtLink({
              event_name: 'bambuser',
              event_category: 'bambuser',
              event_action: 'learn more',
              event_label: 'click',
            });
          });
        }
        window.addEventListener('bambuser-liveshop-tracking-point', function(event) {
          var detail;
          var detailData;
          detail = event.detail;
          if (!!detail.data) {
            detailData = detail.data;
            if (detail.event === 'on-load') {
              self.analytics.bambuserOnLoadEvent(detailData);
            } else if (detail.event === 'on-play') {
              self.analytics.bambuserOnPlayEvent(detailData);
            } else if (detail.event === 'on-stop') {
              self.analytics.bambuserOnStopEvent(detailData);
            } else if (detail.event === 'on-interaction' && !!detailData.interactionType) {
              self.analytics.bambuserOnInteractionEvent(detailData);
            }
          }
        });
      }
    }
  };
})(jQuery, Drupal);
