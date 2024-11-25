/** @odoo-module **/

import { registerModel } from '@mail/model/model_core';
import { attr, one } from '@mail/model/model_field';

registerModel({
    name: 'NotificationMessageView',
    recordMethods: {
        onComponentUpdate() {
            if (!this.exists()) {
                return;
            }
            if (this.messageListViewItemOwner.threadViewOwnerAsLastMessageListViewItem && this.messageListViewItemOwner.isPartiallyVisible()) {
                this.messageListViewItemOwner.threadViewOwnerAsLastMessageListViewItem.handleVisibleMessage(this.message);
            }
        },
        async onClick(ev) {
            if (ev.target.closest('.o_channel_redirect')) {
                // avoid following dummy href
                ev.preventDefault();
                const channel = this.messaging.models['Thread'].insert({
                    id: Number(ev.target.dataset.oeId),
                    model: 'mail.channel',
                });
                if (!channel.isPinned) {
                    await channel.join();
                    channel.update({ isServerPinned: true });
                }
                channel.open();
                return;
            } else if (ev.target.closest('.o_mail_redirect')) {
                ev.preventDefault();
                this.messaging.openChat({
                    partnerId: Number(ev.target.dataset.oeId)
                });
                return;
            }
            if (ev.target.tagName === 'A') {
                if (ev.target.dataset.oeId && ev.target.dataset.oeModel) {
                    // avoid following dummy href
                    ev.preventDefault();
                    this.messaging.openProfile({
                        id: Number(ev.target.dataset.oeId),
                        model: ev.target.dataset.oeModel,
                    });
                }
                return;
            }
        },
    },
    fields: {
        component: attr(),
        message: one('Message', {
            related: 'messageListViewItemOwner.message',
            inverse: 'notificationMessageViews',
            required: true,
        }),
        messageListViewItemOwner: one('MessageListViewItem', {
            identifying: true,
            inverse: 'notificationMessageView',
        }),
    },
});
