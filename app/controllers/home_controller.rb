class HomeController < ApplicationController
  def index
  end

  def save_image
    if params[:image] and !(params[:image].content_type =~ /image/).nil?
      image_ext = /\/([0-9a-z]+)/.match(params[:image].content_type)[1]
      image_name = rand(36**16).to_s(36) + '.' + image_ext
      path = Rails.root.join('public', Longpost::Application.config.image_path, image_name)

      File.open(path, "wb") do |f|
        f.write(params[:image].read)
      end

      render json: "\"/#{Longpost::Application.config.image_path}#{image_name}\""
    else
      raise ActionController::RoutingError.new('Not Found')
    end
  end
end
